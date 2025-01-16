import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { KPISettingsForm, type KPISettingsFormData } from '@/components/templates/forms/settings/KPISettingsForm';

const StepContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export type KPISettingsData = KPISettingsFormData;

export interface KPISettingsStepProps {
  data: KPISettingsData;
  onSave: (data: KPISettingsData) => void;
}

export const KPISettingsStep: React.FC<KPISettingsStepProps> = ({
  data,
  onSave,
}) => {
  return (
    <StepContainer>
      <Typography variant="h6" gutterBottom>
        KPI設定
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        テンプレートの効果を測定するためのKPIを設定します。
        システムメトリクスとカスタムメトリクスを組み合わせて、
        最適な評価指標を設定してください。
      </Typography>

      <KPISettingsForm
        data={data}
        onChange={onSave}
      />
    </StepContainer>
  );
}; 