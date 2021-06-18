import React from 'react';
import { Table } from '@dracula/dracula-ui';

const ResultsTable = () => {
    return (
        <Table>
            <thead>
                <tr>
                    <th className="drac-text drac-text-white">Name</th>
                    <th className="drac-text drac-text-white">Story Points</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="drac-text drac-text-white">Dezan</td>
                    <td className="drac-text drac-text-white"><i className="pi pi-eye-slash"></i></td>
                </tr>
                <tr>
                    <td className="drac-text drac-text-white">Dezan</td>
                    <td className="drac-text drac-text-white"><i className="pi pi-eye-slash"></i></td>
                </tr>
                <tr>
                    <td className="drac-text drac-text-white">Dezan</td>
                    <td className="drac-text drac-text-white">?</td>
                </tr>
                <tr>
                    <td className="drac-text drac-text-white">Dezan</td>
                    <td className="drac-text drac-text-white">0.5</td>
                </tr>
                <tr>
                    <td className="drac-text drac-text-white">Dezan</td>
                    <td className="drac-text drac-text-white">15</td>
                </tr>
                <tr>
                    <td className="drac-text drac-text-white">Dezan</td>
                    <td className="drac-text drac-text-white">5</td>
                </tr>
                <tr>
                    <th className="drac-text drac-text-white">Median</th>
                    <th className="drac-text drac-text-white">5</th>
                </tr>
            </tbody>
        </Table>
    );
}

export default ResultsTable;