import React from 'react';
import { Divider, Text } from 'dracula-ui';

export default function Footer() {
    return (
        <div className="footer drac-my-xs">
            <Divider color="purple"></Divider>
            <Text color="pinkPurple">Developed with <i className="pi pi-heart"></i> by Gabriel Dezan Busarello <a href="https://github.com/gabrielbusarello" target="_blank" rel="noreferrer"><i className="pi pi-github"></i></a></Text>
        </div>
    );
}