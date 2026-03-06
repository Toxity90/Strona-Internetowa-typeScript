import React from 'react';

export interface TextInputProps {
    text: string;
}

const TextInput: React.FC<TextInputProps> = ({ text }) => {
    return (
        <div>
            <input value={text} />
        </div>
    );
};

export default TextInput;