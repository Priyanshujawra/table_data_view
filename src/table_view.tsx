import React, { useEffect, useState } from 'react';
import { DataTable, DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { Paginator } from 'primereact/paginator';

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

const ArtworksTable: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [first, setFirst] = useState<number>(0);
    const rows = 10;

    useEffect(() => {
        fetchArtworks(1);
    }, []);

    const fetchArtworks = async (page: number) => {
        const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
        const data = await response.json();
        setArtworks(data.data);
        setTotalRecords(data.pagination.total);
    };

    const onPageChange = (e: any) => {
        setFirst(e.first);
        const page = e.page + 1;
        fetchArtworks(page);
    };

    const onRowSelect = (event: DataTableRowClickEvent) => {
        const artwork = event.data;
        setSelectedArtworks([...selectedArtworks, artwork]);
    };

    const onRowUnselect = (event: DataTableRowClickEvent) => {
        const artwork = event.data;
        setSelectedArtworks(selectedArtworks.filter(item => item.id !== artwork.id));
    };

    return (
        <div>
            <DataTable value={artworks} paginator
                selectionMode="multiple"
                selection={selectedArtworks}
                onSelectionChange={e => setSelectedArtworks(e.value)}
                onRowClick={onRowSelect}
                onRowUnselect={onRowUnselect}
                dataKey="id"
                rows={rows}
                totalRecords={totalRecords}
                first={first}
                onPage={onPageChange}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                <Column field="title" header="Title" sortable></Column>
                <Column field="place_of_origin" header="Place of Origin" sortable></Column>
                <Column field="artist_display" header="Artist Display" sortable></Column>
                <Column field="inscriptions" header="Inscriptions" sortable></Column>
                <Column field="date_start" header="Date Start" sortable></Column>
                <Column field="date_end" header="Date End" sortable></Column>
            </DataTable>
            <Paginator first={first} rows={rows} totalRecords={totalRecords} onPageChange={onPageChange} />
        </div>
    );
};

export default ArtworksTable;
