import React, { MouseEventHandler, PropsWithChildren, useMemo } from 'react';
import { Button, Box, Input, Text, BoxProps, Heading, Divider, DividerProps, dividerColors } from 'dracula-ui';
import BackgroundBlock from './BackgrounBlock';

interface IModalProps {
    title: string;
    boxProps?: BoxProps;
    dividerColor?: keyof typeof dividerColors,
    borderWidth?: string;
    borderStyle?: string;
    onBackgroundClick?: any
}

const Modal = ({ children, title, boxProps, dividerColor, borderWidth, borderStyle, onBackgroundClick }: PropsWithChildren<IModalProps>) => {
    return (
        <>
            <BackgroundBlock onClick={onBackgroundClick} />
            <div className="modal">
                <Box
                    rounded="xl"
                    color="black"
                    width="xs"
                    className="text-center"
                    p="xs"
                    borderColor="purple"
                    style={{ borderWidth: borderWidth ?? '2px', borderStyle: borderStyle ?? 'solid' }}
                    {...boxProps}
                >
                    <Heading size="lg">{ title }</Heading>
                    <Divider color={dividerColor ?? "purple"}  />
                    { children }
                </Box>
            </div>
        </>
    );
}

export default Modal;