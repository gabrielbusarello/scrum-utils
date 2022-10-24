import React, { FC } from 'react';
import { Button, ButtonProps } from 'dracula-ui';

interface EstimateButtonProps {

}

// const EstimateButton: FC<ButtonProps & EstimateButtonProps> = (props) => {
const EstimateButton: FC<any> = (props) => {
    return (
        <Button size="lg" variant="outline" color={props.color} onClick={props.onClick}>{ props.children }</Button>
    );
}

export default EstimateButton;