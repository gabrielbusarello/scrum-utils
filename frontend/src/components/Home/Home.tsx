import React, { useCallback, useMemo, useState } from 'react';
import { Button, Card, Input, Text } from 'dracula-ui';
import { useHistory } from 'react-router-dom';
import { ref, set, push } from "firebase/database";
import './Home.scss'
import { useFirebase } from '../../Firebase';

export default function Home() {
    const history = useHistory();
    const { database, user } = useFirebase();
    const [ room, setRoom ] = useState<string>('');

    const createRoom = useCallback(() => {
        if (user) {
            const roomCode = (+new Date()).toString(36).slice(-6);
            const roomRef = ref(database, `rooms/${roomCode}`);
            const userRef = ref(database, `users/${roomCode}/${user.uid}`);
    
            set(roomRef, {
                allAdmin: true,
                createdBy: user.uid,
                status: false
            }).then(() => {
                set(userRef, {
                    name: user.displayName,
                    vote: null
                });
                history.push(`room/${roomCode}`);
            });
        }
    }, [database, history, user]);

    const enterRoom = () => {
        history.push(`room/${room}`);
    }

    const onChangeInput = useCallback((event: any) => {
        setRoom(event.target.value);
    }, []);

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
                    value={room}
                    onChange={onChangeInput}
                />
                <Button color="animated" size="md" ml="md" onClick={enterRoom}>Enter in room!</Button>
            </div>
        </React.Fragment>
    );
}