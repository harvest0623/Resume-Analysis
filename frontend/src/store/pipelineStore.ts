import { create } from 'zustand';
import {
    PipelineStage,
    Candidate,
    PipelineFilters,
    FunnelData,
    TrendData,
    DepartmentStats,
    PipelineConfig,
    UserRole,
    RolePermissions,
    DEFAULT_PIPELINE_STAGES,
    ROLE_PERMISSIONS,
    TimeDimension,
    CandidateStatus
} from '@/types/pipeline';

/** 模拟候选人数据 */
const generateMockCandidates = (): Candidate[] => {
    const departments = ['技术部', '产品部', '设计部', '市场部', '运营部'];
    const positions = ['前端开发', '后端开发', '产品经理', 'UI设计师', '数据分析师'];
    const stages = ['applied', 'screening', 'written', 'interview', 'offer', 'hired'];
    const statuses: CandidateStatus[] = ['pending', 'screening', 'interviewing', 'offered', 'hired', 'rejected'];

    return Array.from({ length: 156 }, (_, i) => ({
        id: `candidate-${i + 1}`,
        name: `候选人${i + 1}`,
        email: `candidate${i + 1}@example.com`,
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        position: positions[Math.floor(Math.random() * positions.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        currentStage: stages[Math.floor(Math.random() * stages.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        appliedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        score: Math.floor(Math.random() * 40) + 60,
        tags: Math.random() > 0.5 ? ['高优先级'] : undefined,
    }));
};

/** 模拟漏斗数据 */
const generateMockFunnelData = (totalApplied: number): FunnelData[] => {
    const stages = DEFAULT_PIPELINE_STAGES;
    let currentCount = totalApplied;

    return stages.map((stage, index) => {
        const count = currentCount;
        const conversionRate = index === 0 ? 100 : Math.floor(Math.random() * 30) + 40;
        currentCount = Math.floor(count * conversionRate / 100);

        return {
            stageId: stage.id,
            stageName: stage.name,
            count,
            percentage: (count / totalApplied) * 100,
            conversionRate: index === 0 ? 100 : conversionRate,
            avgDays: Math.floor(Math.random() * 5) + 1,
        };
    });
};

/** 模拟趋势数据 */
const generateMockTrendData = (dimension: TimeDimension): TrendData[] => {
    const data: TrendData[] = [];
    const now = new Date();
    let periods: number;

    switch (dimension) {
        case 'day':
            periods = 30;
            break;
        case 'week':
            periods = 12;
            break;
        case 'month':
            periods = 6;
            break;
        case 'quarter':
            periods = 4;
            break;
    }

    for (let i = periods - 1; i >= 0; i--) {
        const date = new Date(now);
        switch (dimension) {
            case 'day':
                date.setDate(date.getDate() - i);
                break;
            case 'week':
                date.setDate(date.getDate() - i * 7);
                break;
            case 'month':
                date.setMonth(date.getMonth() - i);
                break;
            case 'quarter':
                date.setMonth(date.getMonth() - i * 3);
                break;
        }

        data.push({
            date: date.toISOString().split('T')[0],
            applied: Math.floor(Math.random() * 30) + 10,
            screening: Math.floor(Math.random() * 20) + 5,
            interview: Math.floor(Math.random() * 15) + 3,
            offer: Math.floor(Math.random() * 5) + 1,
            hired: Math.floor(Math.random() * 3) + 1,
        });
    }

    return data;
};

/** 模拟部门统计数据 */
const generateMockDepartmentStats = (): DepartmentStats[] => {
    const departments = ['技术部', '产品部', '设计部', '市场部', '运营部'];

    return departments.map(dept => {
        const applied = Math.floor(Math.random() * 60) + 20;
        const screening = Math.floor(applied * 0.6);
        const interview = Math.floor(screening * 0.5);
        const offer = Math.floor(interview * 0.3);
        const hired = Math.floor(offer * 0.7);

        return {
            department: dept,
            applied,
            screening,
            interview,
            offer,
            hired,
            conversionRate: applied > 0 ? (hired / applied * 100) : 0,
            avgDays: Math.floor(Math.random() * 15) + 10,
        };
    });
};

interface PipelineState {
    /** 漏斗阶段数据 */
    stages: PipelineStage[];
    /** 候选人列表 */
    candidates: Candidate[];
    /** 漏斗统计 */
    funnelData: FunnelData[];
    /** 趋势数据 */
    trendData: TrendData[];
    /** 部门统计 */
    departmentStats: DepartmentStats[];
    /** 筛选条件 */
    filters: PipelineFilters;
    /** 当前用户角色 */
    userRole: UserRole;
    /** 当前用户权限 */
    permissions: RolePermissions;
    /** 漏斗配置 */
    config: PipelineConfig | null;
    /** 选中的阶段 */
    selectedStage: string | null;
    /** 选中的候选人 */
    selectedCandidates: Set<string>;
    /** 加载状态 */
    loading: boolean;
    /** 导出状态 */
    exporting: boolean;

    // Actions
    /** 初始化数据 */
    initialize: () => void;
    /** 更新筛选条件 */
    updateFilters: (filters: Partial<PipelineFilters>) => void;
    /** 选择阶段 */
    selectStage: (stageId: string | null) => void;
    /** 切换候选人选中状态 */
    toggleCandidateSelection: (candidateId: string) => void;
    /** 全选/取消全选 */
    toggleSelectAll: (select: boolean) => void;
    /** 更新候选人状态 */
    updateCandidateStatus: (candidateId: string, status: CandidateStatus) => void;
    /** 批量更新候选人状态 */
    bulkUpdateStatus: (status: CandidateStatus) => void;
    /** 设置用户角色 */
    setUserRole: (role: UserRole) => void;
    /** 更新漏斗配置 */
    updatePipelineConfig: (config: Partial<PipelineConfig>) => void;
    /** 刷新趋势数据 */
    refreshTrendData: (dimension: TimeDimension) => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
    stages: DEFAULT_PIPELINE_STAGES,
    candidates: [],
    funnelData: [],
    trendData: [],
    departmentStats: [],
    filters: {
        timeDimension: 'month',
    },
    userRole: 'admin',
    permissions: ROLE_PERMISSIONS.admin,
    config: null,
    selectedStage: null,
    selectedCandidates: new Set(),
    loading: false,
    exporting: false,

    initialize: () => {
        set({ loading: true });

        // 模拟异步加载
        setTimeout(() => {
            const candidates = generateMockCandidates();
            const funnelData = generateMockFunnelData(candidates.length);
            const trendData = generateMockTrendData('month');
            const departmentStats = generateMockDepartmentStats();

            // 更新阶段数据
            const stages = DEFAULT_PIPELINE_STAGES.map(stage => {
                const funnel = funnelData.find(f => f.stageId === stage.id);
                return {
                    ...stage,
                    count: funnel?.count || 0,
                    conversionRate: funnel?.conversionRate || 0,
                };
            });

            set({
                candidates,
                funnelData,
                trendData,
                departmentStats,
                stages,
                loading: false,
            });
        }, 500);
    },

    updateFilters: (newFilters) => {
        const filters = { ...get().filters, ...newFilters };
        set({ filters, loading: true });

        // 重新加载数据
        setTimeout(() => {
            const candidates = generateMockCandidates();
            const funnelData = generateMockFunnelData(candidates.length);
            const trendData = generateMockTrendData(filters.timeDimension);

            set({
                candidates,
                funnelData,
                trendData,
                loading: false,
            });
        }, 300);
    },

    selectStage: (stageId) => {
        set({ selectedStage: stageId });
    },

    toggleCandidateSelection: (candidateId) => {
        const selected = new Set(get().selectedCandidates);
        if (selected.has(candidateId)) {
            selected.delete(candidateId);
        } else {
            selected.add(candidateId);
        }
        set({ selectedCandidates: selected });
    },

    toggleSelectAll: (select) => {
        if (select) {
            const candidates = get().candidates;
            const selected = new Set(candidates.map(c => c.id));
            set({ selectedCandidates: selected });
        } else {
            set({ selectedCandidates: new Set() });
        }
    },

    updateCandidateStatus: (candidateId, status) => {
        const candidates = get().candidates.map(c =>
            c.id === candidateId ? { ...c, status, updatedAt: new Date().toISOString() } : c
        );
        set({ candidates });
    },

    bulkUpdateStatus: (status) => {
        const { candidates, selectedCandidates } = get();
        const updated = candidates.map(c =>
            selectedCandidates.has(c.id) ? { ...c, status, updatedAt: new Date().toISOString() } : c
        );
        set({ candidates: updated, selectedCandidates: new Set() });
    },

    setUserRole: (role) => {
        set({
            userRole: role,
            permissions: ROLE_PERMISSIONS[role],
        });
    },

    updatePipelineConfig: (configUpdate) => {
        const currentConfig = get().config;
        const newConfig: PipelineConfig = {
            id: currentConfig?.id || 'default',
            name: currentConfig?.name || '默认漏斗',
            stages: currentConfig?.stages || DEFAULT_PIPELINE_STAGES,
            isDefault: true,
            createdBy: 'admin',
            createdAt: currentConfig?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...configUpdate,
        };
        set({ config: newConfig });
    },

    refreshTrendData: (dimension) => {
        const trendData = generateMockTrendData(dimension);
        set({ trendData });
    },
}));
