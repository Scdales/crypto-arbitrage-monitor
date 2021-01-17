import React from "react";
import { useTable } from "react-table";

const Table = ({ data }) => {
    const columns = React.useMemo(
        () => [
            {
                Header: 'Time',
                accessor: 'col1',
            },
            {
                Header: 'Exchanges',
                accessor: 'col2',
            },
            {
                Header: 'Difference',
                accessor: 'col3',
            },
        ],[]);

   const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <table {...getTableProps()} style={{}}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                        <th
                            {...column.getHeaderProps()}
                            style={{
                                background: '#e0e5f7',
                                color: 'black',
                                fontWeight: 'bold',
                                height: '30px',
                                minWidth: '200px',
                        }}>
                            {column.render('Header')}
                        </th>
                        ))}
                    </tr>
                ))}
            </thead>

            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                            return (
                                <td
                                    {...cell.getCellProps()}
                                    style={{
                                        background: '#c8d0ec',
                                        padding: '10px',
                                    }}>
                                    {cell.render('Cell')}
                                </td>
                            );
                        })}
                    </tr>
                    )
                })}
            </tbody>
        </table>
    );
};

export default Table;
