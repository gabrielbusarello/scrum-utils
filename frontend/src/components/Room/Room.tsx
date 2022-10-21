import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Divider, Text } from 'dracula-ui';
import EstimateButton from '../EstimateButton/EstimateButton';
import './Room.scss';
import ResultsTable from '../ResultsTable/ResultsTable';
import { useFirebase } from '../../Firebase';
import { onValue, ref, set, update, remove, Unsubscribe } from 'firebase/database';
import { useHistory, useParams } from 'react-router-dom';

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
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const { database, auth, user } = useFirebase();
    const roomRef = ref(database, `rooms/${id}`);
    const usersRef = ref(database, `users/${id}`);
    // const roomRef = doc(database, "room", "146170");
    // const usersRef = doc(database, "room", "146170", "users");
    const [ status, setStatus ] = useState(false);
    const [ createdBy, setCreatedBy ] = useState(null);
    const [ allAdmin, setAllAdmin ] = useState(false);
    const [ users, setUsers ] = useState<{
        key: string;
        name: string;
        vote: number;
    }[]>([]);

    const getButtons = () => {
        return EstimateButtons.map((eb) => {
            return (<EstimateButton color="green" onClick={() => onEstimateClick(eb)} key={eb}>{eb}</EstimateButton>)
        });
    };

    useEffect(() => {
        const roomListener = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                history.replace('/');
                return;
            }
            setStatus(data.status);
            setCreatedBy(data.createdBy);
            setAllAdmin(data.allAdmin);
        });

        const usersListener = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersKeys = Object.keys(data);
                const users = Object.values<{ name: string, vote: number }>(data).map((user: { name: string, vote: number }, index) => {
                    const key: string = usersKeys[index];
    
                    return {
                        key,
                        name: user.name,
                        vote: user.vote
                    }
                });
                setUsers(users);
            } else {
                setUsers([]);
            }
        });

        return () => {
            roomListener();
            usersListener();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (user && users.length > 0) {
            if (!users.find(currentUser => currentUser.key === user.uid)) {
                const userRef = ref(database, `users/${id}/${user.uid}`);

                set(userRef, {
                    name: user.displayName,
                    vote: null
                });
            }
        }
    }, [database, id, user, users]);

    const onHideClick = useCallback(() => {
        update(roomRef, {
            status: false
        });
    }, [roomRef]);

    const onShowClick = useCallback(() => {
        update(roomRef, {
            status: true
        });
    }, [roomRef]);

    const onDeleteEstimatesClick = useCallback(() => {
        users.forEach((user) => {
            const userRef = ref(database, `users/${id}/${user.key}`);

            update(userRef, {
                vote: null
            });
        });
    }, [database, id, users]);

    const onEstimateClick = useCallback((vote) => {
        if (user) {
            const userRef = ref(database, `users/${id}/${user.uid}`);

            update(userRef, {
                vote
            });
        }
    }, [database, id, user]);

    const onClearClick = useCallback(() => {
        if (user) {
            users.filter(currentUser => currentUser.key !== user.uid).forEach((user) => {
                const userRef = ref(database, `users/${id}/${user.key}`);
    
                remove(userRef);
            });
        }
    }, [database, id, user, users]);

    const hasPermission = useMemo(() => {
        if (allAdmin) {
            return true;
        }

        return createdBy === user?.uid;
    }, [allAdmin, createdBy, user]);

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
                    { createdBy === user?.uid && <Button variant="ghost" color="purple" onClick={onClearClick}>Clear Room</Button> }
                </div>
                <div className="buttons">
                    { hasPermission && status && <Button color="animated" mb="sm" onClick={onHideClick}>Hide <i className="pi pi-eye-slash"></i></Button> }
                    { hasPermission && !status && <Button color="animated" mb="sm" onClick={onShowClick}>Show <i className="pi pi-eye"></i></Button> }
                    { hasPermission && <Button variant="ghost" color="purple" onClick={onDeleteEstimatesClick}>Delete Estimates</Button> }
                </div>
            </div>
            <ResultsTable users={users} status={status} ></ResultsTable>
        </React.Fragment>
    );
}