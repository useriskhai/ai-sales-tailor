# テンプレートコンポーネントの依存関係

## コンポーネント階層図

```mermaid
graph TD
    %% ページコンポーネント
    TM[TemplateManager]
    TD[TemplateDetails]
    TTP[TemplateTestingPanel]

    %% ウィザードコンポーネント
    CTW[CreateTemplateWizard]
    CTD[CreateTemplateDialog]
    
    %% ステップコンポーネント
    BIS[BasicInfoStep]
    MSS[MessageStrategyStep]
    ESS[ExecutionSettingsStep]
    KSS[KPISettingsStep]

    %% フォームコンポーネント
    BSF[BasicSettingsForm]
    CSF[CustomSettingsForm]
    ESF[ExecutionSettingsForm]
    KSF[KPISettingsForm]
    MTE[MessageTemplateEditor]

    %% 共有コンポーネント
    TSM[TemplateSettingsMode]

    %% 依存関係
    TM --> CTD
    CTD --> CTW
    CTW --> BIS
    CTW --> MSS
    CTW --> ESS
    CTW --> KSS

    MSS --> BSF
    MSS --> CSF
    MSS --> MTE
    MSS --> TSM

    ESS --> ESF
    KSS --> KSF

    TD --> TSM
    TD --> MTE
    TD --> KSF
```

## コンポーネントグループ

```mermaid
graph TD
    subgraph Pages
        TM[TemplateManager]
        TD[TemplateDetails]
        TTP[TemplateTestingPanel]
    end

    subgraph Wizard
        CTW[CreateTemplateWizard]
        CTD[CreateTemplateDialog]
        subgraph Steps
            BIS[BasicInfoStep]
            MSS[MessageStrategyStep]
            ESS[ExecutionSettingsStep]
            KSS[KPISettingsStep]
        end
    end

    subgraph Forms
        subgraph Settings
            BSF[BasicSettingsForm]
            CSF[CustomSettingsForm]
            ESF[ExecutionSettingsForm]
            KSF[KPISettingsForm]
        end
        subgraph Editor
            MTE[MessageTemplateEditor]
        end
    end

    subgraph Shared
        TSM[TemplateSettingsMode]
    end

    %% グループ間の依存関係
    Pages --> Wizard
    Pages --> Forms
    Pages --> Shared
    Wizard --> Forms
    Wizard --> Shared
    Steps --> Forms
    Steps --> Shared
```

## データフロー

```mermaid
sequenceDiagram
    participant TM as TemplateManager
    participant CTW as CreateTemplateWizard
    participant Steps as ステップコンポーネント
    participant Forms as フォームコンポーネント
    participant API as Template API

    TM->>CTW: テンプレート作成開始
    CTW->>Steps: ステップ表示
    Steps->>Forms: フォーム表示
    Forms-->>Steps: フォームデータ更新
    Steps-->>CTW: ステップデータ更新
    CTW->>API: テンプレート保存
    API-->>TM: 保存完了通知
```

## 注意点

1. **循環依存の防止**
   - ページコンポーネントはフォームを直接使用可能
   - フォームコンポーネントは他のコンポーネントに依存しない
   - 共有コンポーネントは他のコンポーネントに依存しない

2. **状態管理**
   - ページレベルで主要な状態を管理
   - フォームは内部状態のみを管理
   - ステップ間のデータ共有はウィザードを介して行う

3. **再利用性**
   - フォームコンポーネントは独立して再利用可能
   - 共有コンポーネントは汎用的に使用可能
   - ステップコンポーネントはウィザード固有 