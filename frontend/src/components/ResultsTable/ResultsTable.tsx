import React, { useMemo } from 'react';
import { Table } from 'dracula-ui';

const ResultsTable = ({ users, status }: { users: any[], status: boolean }) => {
    return (
        <Table color="green">
            <thead>
                <tr>
                    <th className="drac-text drac-text-white">Name</th>
                    <th className="drac-text drac-text-white">Story Points</th>
                </tr>
            </thead>
            <tbody>
                {
                    users.map((user, index) => {
                        return (
                            <tr key={index}>
                                <td className="drac-text drac-text-white">{ user.name }</td>
                                <td className="drac-text drac-text-white">
                                    { !status && <i className="pi pi-eye-slash"></i>}
                                    { !status && Boolean(user.vote) && <i className="pi pi-check-circle drac-ml-sm"></i>}
                                    { status && user.vote }
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
    );
}

export default ResultsTable;