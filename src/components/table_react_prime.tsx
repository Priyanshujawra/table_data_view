import { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { OverlayPanel } from 'primereact/overlaypanel';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

export default function ArtworkTable() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
    const [page, setPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const rowsPerPage = 12;

    const [inputRow, setInputRow] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const op = useRef<OverlayPanel>(null);

   
    const fetchArtworks = async (page: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page + 1}`);
            const fetchedArtworks = response.data.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                place_of_origin: item.place_of_origin,
                artist_display: item.artist_display,
                inscriptions: item.inscriptions,
                date_start: item.date_start,
                date_end: item.date_end,
            }));
            setArtworks(fetchedArtworks);
            setTotalRecords(response.data.pagination.total);
        } catch (error) {
            console.error('Error fetching artworks:', error);
        } finally {
            setLoading(false);
        }
    };

   
    const fetchMultiplePages = async (startPage: number, pagesToFetch: number) => {
        const requests = [];
        for (let i = 0; i < pagesToFetch; i++) {
            requests.push(axios.get(`https://api.artic.edu/api/v1/artworks?page=${startPage + i + 1}`));
        }
        try {
            const responses = await Promise.all(requests);
            return responses.flatMap(response => response.data.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                place_of_origin: item.place_of_origin,
                artist_display: item.artist_display,
                inscriptions: item.inscriptions,
                date_start: item.date_start,
                date_end: item.date_end,
            })));
        } catch (error) {
            console.error('Error fetching artworks from multiple pages:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchArtworks(page);
    }, [page]);

    const onPageChange = (e: any) => {
        setPage(e.first / rowsPerPage);
    };

    const handleRowSelection = async () => {
        if (inputRow) {
            setErrorMessage(null);

            let rowsToSelect: Artwork[] = [];

           
            const currentPageRows = artworks.slice(0, Math.min(inputRow, rowsPerPage));
            rowsToSelect = [...rowsToSelect, ...currentPageRows];

            const remainingRows = inputRow - rowsToSelect.length;
            const pagesToFetch = Math.ceil(remainingRows / rowsPerPage);

            
            if (remainingRows > 0) {
                const additionalArtworks = await fetchMultiplePages(page + 1, pagesToFetch);
                const additionalRows = additionalArtworks.slice(0, remainingRows);
                rowsToSelect = [...rowsToSelect, ...additionalRows];
            }

            setSelectedArtworks(rowsToSelect);
        }
        op.current?.hide();
    };

    const headerButtonTemplate = useMemo(() => (
        <div className="flex align-items-center">
            <Button icon="" onClick={(e) => op.current?.toggle(e)} label="˅" />
            <OverlayPanel ref={op}>
                <div className="p-field">
                    <label htmlFor="rowNumber">Row Number</label>
                    <InputNumber
                        id="rowNumber"
                        value={inputRow}
                        onValueChange={(e: any) => setInputRow(e.value)}
                        min={1}
                    />
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <Button label="Select" onClick={handleRowSelection} />
            </OverlayPanel>
        </div>
    ), [inputRow, errorMessage]); 

    return (
        <div className="card">
            {loading ? (
                <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <ProgressSpinner
                        style={{ width: '50px', height: '50px' }}
                        strokeWidth="8"
                        fill="var(--surface-ground)"
                        animationDuration=".5s"
                    />
                </div>
            ) : (
                <DataTable
                    value={artworks}
                    paginator
                    first={page * rowsPerPage}
                    rows={rowsPerPage}
                    totalRecords={totalRecords}
                    lazy
                    onPage={onPageChange}
                    selectionMode="multiple"
                    selection={selectedArtworks}
                    onSelectionChange={(e: any) => setSelectedArtworks(e.value)}
                    dataKey="id"
                    tableStyle={{ minWidth: '50rem' }}
                    responsiveLayout="scroll"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column header={headerButtonTemplate} headerStyle={{  textAlign: 'center' }}></Column>
                    <Column field="title" header="Title"></Column>
                    <Column field="place_of_origin" header="Place of Origin"></Column>
                    <Column field="artist_display" header="Artist Display"></Column>
                    <Column field="inscriptions" header="Inscriptions"></Column>
                    <Column field="date_start" header="Date Start"></Column>
                    <Column field="date_end" header="Date End"></Column>
                </DataTable>
            )}
        </div>
    );
}
