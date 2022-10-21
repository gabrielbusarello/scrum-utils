import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Divider, Text } from 'dracula-ui';
import { collection, doc, onSnapshot, setDoc, updateDoc, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import EstimateButton from '../EstimateButton/EstimateButton';
import './Room.scss';
import ResultsTable from '../ResultsTable/ResultsTable';
import { useFirebase } from '../../Firebase';

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
    const { database, auth, user } = useFirebase();
    const roomRef = doc(database, "room", "146170");
    const userCollectionRef = collection(database, "room", "146170", "users");
    const [ status, setStatus ] = useState(false);
    const [ createdBy, setCreatedBy ] = useState(null);
    const [ allAdmin, setAllAdmin ] = useState(false);
    const [ users, setUsers ] = useState<DocumentData[]>([]);
    const usersDocRef = useRef<any[]>([]);

    const getButtons = () => {
        return EstimateButtons.map((eb) => {
            return (<EstimateButton color="green" onClick={() => onEstimateClick(eb)}>{eb}</EstimateButton>)
        });
    }

    useEffect(() => {
        onSnapshot(roomRef, (room) => {
            const data = room.data();

            if (data) {
                setStatus(data.status);
                setCreatedBy(data.createdBy);
                setAllAdmin(data.allAdmin);
            }
        });
        onSnapshot(userCollectionRef, (userCollection) => {
            const users = userCollection.docs.map(doc => doc.data());
            usersDocRef.current = userCollection.docs;
            setUsers(users);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onHideClick = useCallback(() => {
        updateDoc(roomRef, {
            status: false
        });
    }, [roomRef]);

    const onShowClick = useCallback(() => {
        updateDoc(roomRef, {
            status: true
        });
    }, [roomRef]);

    const onDeleteEstimatesClick = useCallback(() => {
        usersDocRef.current.forEach((userDocRef) => {
            const docPath = userDocRef._key.path.segments.slice(userDocRef._key.path.len + 2, userDocRef._key.path.len + userDocRef._key.path.offset);
            const userDoc = doc(database, 'room', ...docPath);

            updateDoc(userDoc, {
                vote: null
            });
        })
        onHideClick();
    }, []);

    const onEstimateClick = useCallback((vote) => {
        if (user) {
            const userDocRef = doc(database, "room", "146170", "users", user.uid);
    
            updateDoc(userDocRef, {
                vote: vote
            });
        }
    }, [database, user]);

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
                    { hasPermission && <Button variant="ghost" color="purple">Clear Room</Button> }
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