import React, { useEffect } from 'react';
import { Button, Divider, Text } from '@dracula/dracula-ui';
import EstimateButton from '../EstimateButton/EstimateButton';
import './Room.scss';
import ResultsTable from '../ResultsTable/ResultsTable';
import { getWebsocket } from '../../services/WebSocket';

const EstimateButtons = [
    '?',
    '0',
    '0.5',
    '1',
    '2',
    '3',
    '5',
    '8',
    '13',
    '21',
    '34',
    '55'
];

export default function Room() {
    const getButtons = () => {
        return EstimateButtons.map((eb) => {
            return (<EstimateButton color="green">{eb}</EstimateButton>)
        });
    }

    useEffect(() => {
        getWebsocket.subscribe({
            next: () => {
                debugger;
            },
            error: (error) => {
                console.log(error);
            }
        });
    }, []);

    return (
        <React.Fragment>
            <Text color="pinkPurple" size="lg">Submit Estimates</Text>
            <div className="estimate-buttons-container drac-my-sm">
                {getButtons()}
            </div>
            <Divider color="purple"></Divider>
            <div className="results-header drac-my-sm">
                <div className="left">
                    <Text color="pinkPurple" size="lg" mb="sm">Results</Text>
                    <Button variant="ghost" color="purple">Clear Room</Button>
                </div>
                <div className="buttons">
                    <Button color="animated" mb="sm">Hide <i className="pi pi-eye-slash"></i></Button>
                    <Button color="animated" mb="sm">Show <i className="pi pi-eye"></i></Button>
                    <Button variant="ghost" color="purple">Delete Estimates</Button>
                </div>
            </div>
            <ResultsTable></ResultsTable>
        </React.Fragment>
    );
}