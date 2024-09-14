import React from 'react';

import CheckboxRowSelectionDemo from './components/table_react_prime';
// import ArtworksTable from './table_view';


const App: React.FC = () => {
    return (
        <div className="App">
            <h1>Data Table</h1>
           
           <CheckboxRowSelectionDemo></CheckboxRowSelectionDemo>
            {/* <ArtworksTable /> */}
        </div>
    );
};

export default App;
