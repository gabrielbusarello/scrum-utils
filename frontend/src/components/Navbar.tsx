import { Heading } from 'dracula-ui';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useFirebase } from '../Firebase';

const Navbar = () => {
    const location = useLocation<{ id: string }>();
    const id = location.pathname.split('/').pop();
    const { user } = useFirebase();

    return (
        <div className="header drac-m-sm">
            <Heading color="pinkPurple">Scrum Poker</Heading>
            { id && <Heading color="pinkPurple">Room { id }</Heading> }
            { user && <Heading color="pinkPurple">{ user.displayName }</Heading>}
        </div>
    );
}

export default Navbar;
