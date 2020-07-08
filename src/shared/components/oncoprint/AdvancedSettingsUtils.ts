export enum AdvancedShowAndSortSettingsType {
    DRIVER_MUTATION = 'Driver Mutation',

    AMP = 'Amplification',
    DEL = 'Deletion',
    GAIN = 'Gain',
    HETLOSS = 'Heterozygous Loss',

    FUSION = 'Fusion',

    MISSENSE = 'Missense',
    INFRAME = 'Inframe',
    PROMOTER = 'Promoter',
    TRUNCATING = 'Truncating',
    OTHER_MUTATION = 'Other Mutation',

    MUTATED = 'Mutated',

    MRNA_HIGH = 'mRNA High',
    MRNA_LOW = 'mRNA Low',

    PROTEIN_HIGH = 'Protein High',
    PROTEIN_LOW = 'Protein Low',

    GERMLINE = 'Germline',
}

export const MutationSettingsTypes = [
    AdvancedShowAndSortSettingsType.MISSENSE,
    AdvancedShowAndSortSettingsType.INFRAME,
    AdvancedShowAndSortSettingsType.PROMOTER,
    AdvancedShowAndSortSettingsType.TRUNCATING,
    AdvancedShowAndSortSettingsType.OTHER_MUTATION,
];

export type AdvancedShowAndSortSettings = {
    type: AdvancedShowAndSortSettingsType;
    show: boolean;
    sameSortPriorityAsPrevious: boolean;
    disableSort: boolean;
}[];

export type AdvancedShowAndSortSettingsWithSortBy = (AdvancedShowAndSortSettings[0] & {
    sortBy: number | null;
})[];
export type AdvancedShowAndSortSettingsWithSortByMap = {
    [type in AdvancedShowAndSortSettingsType]: AdvancedShowAndSortSettingsWithSortBy[0];
};

export const DataValueToAdvancedSettingsType: {
    [val: string]: AdvancedShowAndSortSettingsType;
} = {
    amp: AdvancedShowAndSortSettingsType.AMP,
    homdel: AdvancedShowAndSortSettingsType.DEL,
    gain: AdvancedShowAndSortSettingsType.GAIN,
    hetloss: AdvancedShowAndSortSettingsType.HETLOSS,
    inframe_rec: AdvancedShowAndSortSettingsType.INFRAME,
    inframe: AdvancedShowAndSortSettingsType.INFRAME,
    missense_rec: AdvancedShowAndSortSettingsType.MISSENSE,
    missense: AdvancedShowAndSortSettingsType.MISSENSE,
    promoter_rec: AdvancedShowAndSortSettingsType.PROMOTER,
    promoter: AdvancedShowAndSortSettingsType.PROMOTER,
    trunc_rec: AdvancedShowAndSortSettingsType.TRUNCATING,
    trunc: AdvancedShowAndSortSettingsType.TRUNCATING,
    other_rec: AdvancedShowAndSortSettingsType.OTHER_MUTATION,
    other: AdvancedShowAndSortSettingsType.OTHER_MUTATION,
};
export const AdvancedSettingsTypeToDataValue: Partial<
    { [type in AdvancedShowAndSortSettingsType]: string }
> = {
    [AdvancedShowAndSortSettingsType.AMP]: 'amp',
    [AdvancedShowAndSortSettingsType.DEL]: 'homdel',
    [AdvancedShowAndSortSettingsType.GAIN]: 'gain',
    [AdvancedShowAndSortSettingsType.HETLOSS]: 'hetloss',
    [AdvancedShowAndSortSettingsType.INFRAME]: 'inframe',
    [AdvancedShowAndSortSettingsType.MISSENSE]: 'missense',
    [AdvancedShowAndSortSettingsType.PROMOTER]: 'promoter',
    [AdvancedShowAndSortSettingsType.TRUNCATING]: 'trunc',
    [AdvancedShowAndSortSettingsType.OTHER_MUTATION]: 'other',
};
export const DefaultAdvancedShowAndSortSettings: AdvancedShowAndSortSettings = [
    AdvancedShowAndSortSettingsType.FUSION,
    AdvancedShowAndSortSettingsType.AMP,
    AdvancedShowAndSortSettingsType.DEL,
    AdvancedShowAndSortSettingsType.GAIN,
    AdvancedShowAndSortSettingsType.HETLOSS,
    AdvancedShowAndSortSettingsType.DRIVER_MUTATION,
    AdvancedShowAndSortSettingsType.MUTATED,
    AdvancedShowAndSortSettingsType.TRUNCATING,
    AdvancedShowAndSortSettingsType.INFRAME,
    AdvancedShowAndSortSettingsType.PROMOTER,
    AdvancedShowAndSortSettingsType.MISSENSE,
    AdvancedShowAndSortSettingsType.OTHER_MUTATION,
    AdvancedShowAndSortSettingsType.GERMLINE,
    AdvancedShowAndSortSettingsType.MRNA_HIGH,
    AdvancedShowAndSortSettingsType.MRNA_LOW,
    AdvancedShowAndSortSettingsType.PROTEIN_HIGH,
    AdvancedShowAndSortSettingsType.PROTEIN_LOW,
].map(type => ({
    type,
    show: true,
    sameSortPriorityAsPrevious: false,
    disableSort: false,
})); // default needs to have all those options in there in order for mobx to register them all for settings interface
export function getAdvancedSettingsWithSortBy(
    settings: AdvancedShowAndSortSettings
) {
    const settingsWithSortBy: (AdvancedShowAndSortSettings[0] & {
        sortBy: number | null;
    })[] = [];

    let previousPriority: number = 0; // this wont be used unless all the first rows have disableSort set to true

    settings.forEach((s, index) => {
        let sortBy: number | null;
        if (s.disableSort || !s.show) {
            sortBy = null;
        } else if (index === 0) {
            sortBy = 1;
        } else if (s.sameSortPriorityAsPrevious) {
            sortBy = previousPriority;
        } else {
            sortBy = previousPriority + 1;
        }

        if (sortBy !== null) {
            previousPriority = sortBy;
        }

        settingsWithSortBy.push(Object.assign({}, s, { sortBy }));
    });

    return settingsWithSortBy;
}
