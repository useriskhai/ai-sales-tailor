import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StepContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export interface MessageSettingsData {
  messageTemplate: string;
}

export interface MessageSettingsStepProps {
  data: MessageSettingsData;
  onSave: (data: MessageSettingsData) => void;
}

export const MessageSettingsStep: React.FC<MessageSettingsStepProps> = ({
  data,
  onSave,
}) => {
  const [formData, setFormData] = useState<MessageSettingsData>(data);

  const handleChange = (value: string) => {
    const newData = {
      ...formData,
      messageTemplate: value,
    };
    setFormData(newData);
    onSave(newData);
  };

  return (
    <StepContainer>
      <Typography variant="h6" gutterBottom>
        メッセージ設定
      </Typography>

      <TextField
        label="メッセージテンプレート"
        value={formData.messageTemplate}
        onChange={(e) => handleChange(e.target.value)}
        multiline
        rows={10}
        placeholder="メッセージのテンプレートを入力してください"
        fullWidth
      />
    </StepContainer>
  );
}; 