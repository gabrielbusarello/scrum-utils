import React, { FC } from 'react';
import { Button, ButtonProps } from '@dracula/dracula-ui';

interface EstimateButtonProps {

}

const EstimateButton: FC<ButtonProps & EstimateButtonProps> = (props) => {
    return (
        <Button size="lg" variant="outline" color={props.color}>{ props.children }</Button>
    );
}

export default EstimateButton;