import React, { FC } from 'react';
import { Button } from '@dracula/dracula-ui';

interface EstimateButtonProps {
    buttonText: string;
}

const EstimateButton: FC<EstimateButtonProps> = (props) => {
    return (
        <Button size="lg" variant="outline">{ props.buttonText }</Button>
    );
}

export default EstimateButton;