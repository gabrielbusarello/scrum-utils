import React from 'react';
import { Button, Card, Input, Text } from '@dracula/dracula-ui';
import { useHistory } from 'react-router-dom';
import './Home.scss'

export default function Home() {
    const history = useHistory();

    const createRoom = () => {
        history.push('room');
    };

    const enterRoom = () => {
        history.push('room');
    }

    return (
        <React.Fragment>
            <Text color="purpleCyan" size="lg">Welcome to Scrum Poker, ready to remake planning poker once for all?</Text>
            <Card color="purple" p="sm" my="lg" className="text-center">
                <Text color="white">Setup up your planning poker. Just click on the button below</Text>
            </Card>
            <div className="text-center">
                <Button color="animated" size="lg" onClick={createRoom}>Create room!</Button>
            </div>
            <Card color="purple" p="sm" my="lg" className="text-center">
                <Text color="white">Searching for a room already created? Enter the room ID in the input below</Text>
            </Card>
            <div className="search-room drac-my-lg">
                <Input
                    color="purple"
                    variant="normal"
                    borderSize="md"
                    placeholder="Room ID"
                    size="lg"
                />
                <Button color="animated" size="md" ml="md" onClick={enterRoom}>Enter in room!</Button>
            </div>
        </React.Fragment>
    );
}