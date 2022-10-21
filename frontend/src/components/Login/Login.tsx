import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { Button, Box, Input, Text } from 'dracula-ui';
import { signInAnonymously, updateProfile } from "firebase/auth";
import Modal from '../Modal';
import { useFirebase } from '../../Firebase';

const Login = ({ }: { }) => {
    const [ show, setShow ] = useState<boolean>(true);
    const [ username, setUsername ] = useState<string>('');
    const { auth, user } = useFirebase();
    const onLoginRef = useRef<boolean>();
    
    const onLogin = useCallback(() => {
        onLoginRef.current = true;
        signInAnonymously(auth).then(() => {
            console.log('logged in');
        });
    }, [auth]);

    const onChangeInput = useCallback((event: any) => {
        setUsername(event.target.value);
    }, []);
    const debouncedOnChange = debounce(onChangeInput, 300);

    useEffect(() => {
        if (user) {
            if (onLoginRef.current) {
                updateProfile(user, {
                    displayName: username
                }).then(() => {
                    console.log('profile updated');
                    setShow(false);
                });
            } else {
                setShow(false);
            }
        }
    }, [user, username]);

    if (!show) {
        return null;
    }

    return (
        <Modal title="Please Login.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input
                    color="purple"
                    variant="normal"
                    borderSize="md"
                    placeholder="Username"
                    size="lg"
                    onChange={debouncedOnChange}
                />
                <Button color="purple" size="sm" onClick={onLogin}>Login!</Button>
            </div>
        </Modal>
    );
}

export default Login;