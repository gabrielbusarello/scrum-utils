import React, { MouseEventHandler, useMemo } from 'react';
import { Button, Box, Input, Text } from 'dracula-ui';

const BackgroundBlock = ({ onClick }: { onClick?: any }) => {
    return (
        <div className="background-block" onClick={onClick && onClick}></div>
    );
}

export default BackgroundBlock;