import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StepContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const FormField = styled(Box)(({ theme }) => ({
  '& .MuiFormControl-root': {
    width: '100%',
  },
  marginBottom: theme.spacing(3),
}));

const PriorityOption = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
  },
}));

const PriorityTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const PriorityDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

export interface ExecutionSettingsData {
  execution_priority: 'quality' | 'balanced' | 'speed';
}

interface ExecutionSettingsStepProps {
  data: ExecutionSettingsData;
  onSave: (data: ExecutionSettingsData) => void;
}

const PRIORITIES = [
  {
    value: 'quality',
    label: '品質重視',
    description: '高品質な出力を重視し、生成に時間をかけます。より正確で洗練されたメッセージを生成しますが、処理時間は長くなります。',
  },
  {
    value: 'balanced',
    label: 'バランス型',
    description: '品質とスピードのバランスを取ります。一般的なユースケースに最適な設定です。',
  },
  {
    value: 'speed',
    label: 'スピード重視',
    description: '素早い応答を重視します。大量のメッセージを短時間で生成する必要がある場合に適しています。',
  },
] as const;

export const ExecutionSettingsStep: React.FC<ExecutionSettingsStepProps> = ({
  data,
  onSave,
}) => {
  const [formData, setFormData] = useState<ExecutionSettingsData>(data);

  const handleChange = (value: 'quality' | 'balanced' | 'speed') => {
    const newData = {
      ...formData,
      execution_priority: value,
    };
    setFormData(newData);
    onSave(newData);
  };

  return (
    <StepContainer>
      <Typography variant="h6" gutterBottom>
        実行設定
      </Typography>

      <FormField>
        <FormControl component="fieldset">
          <RadioGroup
            value={formData.execution_priority}
            onChange={(e) => handleChange(e.target.value as 'quality' | 'balanced' | 'speed')}
          >
            {PRIORITIES.map((priority) => (
              <PriorityOption
                key={priority.value}
                className={formData.execution_priority === priority.value ? 'selected' : ''}
                onClick={() => handleChange(priority.value)}
              >
                <FormControlLabel
                  value={priority.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <PriorityTitle variant="subtitle1">
                        {priority.label}
                      </PriorityTitle>
                      <PriorityDescription>
                        {priority.description}
                      </PriorityDescription>
                    </Box>
                  }
                  sx={{ margin: 0 }}
                />
              </PriorityOption>
            ))}
          </RadioGroup>
        </FormControl>
      </FormField>
    </StepContainer>
  );
}; 