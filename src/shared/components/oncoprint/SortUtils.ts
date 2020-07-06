import { TrackSortComparator, TrackSortVector } from 'oncoprintjs';
import { ClinicalTrackSpec, GeneticTrackDatum } from './Oncoprint';
import naturalSort from 'javascript-natural-sort';
import _ from 'lodash';

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
export type AdvancedShowAndSortSettings = {
    type: AdvancedShowAndSortSettingsType;
    show: boolean;
    sameSortPriorityAsPrevious: boolean;
}[];

export const DefaultAdvancedShowAndSortSettings: AdvancedShowAndSortSettings = [
    {
        type: AdvancedShowAndSortSettingsType.FUSION,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.AMP,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.DEL,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.GAIN,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.HETLOSS,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.DRIVER_MUTATION,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.MUTATED,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.TRUNCATING,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.INFRAME,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.PROMOTER,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.MISSENSE,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.OTHER_MUTATION,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.GERMLINE,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.MRNA_HIGH,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.MRNA_LOW,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.PROTEIN_HIGH,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
    {
        type: AdvancedShowAndSortSettingsType.PROTEIN_LOW,
        show: true,
        sameSortPriorityAsPrevious: false,
    },
];

/**
 * Get sign of a number
 * @param {number} x
 * @returns {any | any | any}
 */
function sign(x: number): 0 | -1 | 1 {
    if (x > 0) {
        return 1;
    } else if (x < 0) {
        return -1;
    } else {
        return 0;
    }
}

export function getAdvancedSettingsWithSortBy(
    settings: AdvancedShowAndSortSettings
) {
    const settingsWithSortBy: (AdvancedShowAndSortSettings[0] & {
        sortBy: number;
    })[] = [];

    settings.forEach((s, index) => {
        let sortBy;
        if (index === 0) {
            sortBy = 1;
        } else if (s.sameSortPriorityAsPrevious) {
            sortBy = settingsWithSortBy[index - 1].sortBy;
        } else {
            sortBy = settingsWithSortBy[index - 1].sortBy + 1;
        }

        settingsWithSortBy.push(Object.assign({}, s, { sortBy }));
    });

    return settingsWithSortBy;
}

export function getGeneticTrackSortComparator(
    settingsList: AdvancedShowAndSortSettings = DefaultAdvancedShowAndSortSettings,
    sortByMutationType?: boolean,
    sortByDrivers?: boolean
): {
    preferred: TrackSortVector<GeneticTrackDatum>;
    mandatory: TrackSortVector<GeneticTrackDatum>;
    isVector: true;
} {
    const settingsMap = _.keyBy(
        getAdvancedSettingsWithSortBy(settingsList),
        o => o.type
    );

    function mandatoryHelper(d: GeneticTrackDatum): number[] {
        const vector = [];

        // Create vector out of corresponding sort numbers,
        //  then return that vector sorted in ascending order.

        // Fusion
        if (
            d.disp_fusion &&
            settingsMap[AdvancedShowAndSortSettingsType.FUSION].show
        ) {
            vector.push(
                settingsMap[AdvancedShowAndSortSettingsType.FUSION].sortBy
            );
        } else {
            vector.push(Number.POSITIVE_INFINITY);
        }

        // CNA
        let cnaNumberAdded = false;
        switch (d.disp_cna) {
            case 'amp':
                if (settingsMap[AdvancedShowAndSortSettingsType.AMP].show) {
                    vector.push(
                        settingsMap[AdvancedShowAndSortSettingsType.AMP].sortBy
                    );
                    cnaNumberAdded = true;
                }
                break;
            case 'homdel':
                if (settingsMap[AdvancedShowAndSortSettingsType.DEL].show) {
                    vector.push(
                        settingsMap[AdvancedShowAndSortSettingsType.DEL].sortBy
                    );
                    cnaNumberAdded = true;
                }
                break;
            case 'gain':
                if (settingsMap[AdvancedShowAndSortSettingsType.GAIN].show) {
                    vector.push(
                        settingsMap[AdvancedShowAndSortSettingsType.GAIN].sortBy
                    );
                    cnaNumberAdded = true;
                }
                break;
            case 'hetloss':
                if (settingsMap[AdvancedShowAndSortSettingsType.HETLOSS].show) {
                    vector.push(
                        settingsMap[AdvancedShowAndSortSettingsType.HETLOSS]
                            .sortBy
                    );
                    cnaNumberAdded = true;
                }
                break;
        }
        if (!cnaNumberAdded) {
            vector.push(Number.POSITIVE_INFINITY);
        }

        if (
            sortByDrivers &&
            settingsMap[AdvancedShowAndSortSettingsType.DRIVER_MUTATION].show
        ) {
            // Driver mutations
            switch (d.disp_mut) {
                case 'inframe_rec':
                case 'missense_rec':
                case "promoter_rec'":
                case 'trunc_rec':
                case 'other_rec':
                    vector.push(
                        settingsMap[
                            AdvancedShowAndSortSettingsType.DRIVER_MUTATION
                        ].sortBy
                    );
                    break;
                default:
                    vector.push(Number.POSITIVE_INFINITY);
            }
        }

        if (sortByMutationType) {
            // Mutation type
            let numberAdded = false;
            switch (d.disp_mut) {
                case 'inframe_rec':
                case 'inframe':
                    if (
                        settingsMap[AdvancedShowAndSortSettingsType.INFRAME]
                            .show
                    ) {
                        vector.push(
                            settingsMap[AdvancedShowAndSortSettingsType.INFRAME]
                                .sortBy
                        );
                        numberAdded = true;
                    }
                    break;
                case 'missense_rec':
                case 'missense':
                    if (
                        settingsMap[AdvancedShowAndSortSettingsType.MISSENSE]
                            .show
                    ) {
                        vector.push(
                            settingsMap[
                                AdvancedShowAndSortSettingsType.MISSENSE
                            ].sortBy
                        );
                        numberAdded = true;
                    }
                    break;
                case 'promoter_rec':
                case 'promoter':
                    if (
                        settingsMap[AdvancedShowAndSortSettingsType.PROMOTER]
                            .show
                    ) {
                        vector.push(
                            settingsMap[
                                AdvancedShowAndSortSettingsType.PROMOTER
                            ].sortBy
                        );
                        numberAdded = true;
                    }
                    break;
                case 'trunc_rec':
                case 'trunc':
                    if (
                        settingsMap[AdvancedShowAndSortSettingsType.TRUNCATING]
                            .show
                    ) {
                        vector.push(
                            settingsMap[
                                AdvancedShowAndSortSettingsType.TRUNCATING
                            ].sortBy
                        );
                        numberAdded = true;
                    }
                    break;
                case 'other_rec':
                case 'other':
                    if (
                        settingsMap[
                            AdvancedShowAndSortSettingsType.OTHER_MUTATION
                        ].show
                    ) {
                        vector.push(
                            settingsMap[
                                AdvancedShowAndSortSettingsType.OTHER_MUTATION
                            ].sortBy
                        );
                        numberAdded = true;
                    }
                    break;
            }
            if (!numberAdded) {
                vector.push(Number.POSITIVE_INFINITY);
            }
        } else {
            if (
                d.disp_mut &&
                settingsMap[AdvancedShowAndSortSettingsType.MUTATED].show
            ) {
                vector.push(
                    settingsMap[AdvancedShowAndSortSettingsType.MUTATED].sortBy
                );
            } else {
                vector.push(Number.POSITIVE_INFINITY);
            }
        }

        // Germline status
        if (
            d.disp_germ &&
            settingsMap[AdvancedShowAndSortSettingsType.GERMLINE].show
        ) {
            vector.push(
                settingsMap[AdvancedShowAndSortSettingsType.GERMLINE].sortBy
            );
        } else {
            vector.push(Number.POSITIVE_INFINITY);
        }

        // Mrna expression
        let mrnaNumberAdded = false;
        switch (d.disp_mrna) {
            case 'high':
                if (
                    settingsMap[AdvancedShowAndSortSettingsType.MRNA_HIGH].show
                ) {
                    vector.push(
                        settingsMap[AdvancedShowAndSortSettingsType.MRNA_HIGH]
                            .sortBy
                    );
                    mrnaNumberAdded = true;
                }
                break;
            case 'low':
                if (
                    settingsMap[AdvancedShowAndSortSettingsType.MRNA_LOW].show
                ) {
                    vector.push(
                        settingsMap[AdvancedShowAndSortSettingsType.MRNA_LOW]
                            .sortBy
                    );
                    mrnaNumberAdded = true;
                }
                break;
        }
        if (!mrnaNumberAdded) {
            vector.push(Number.POSITIVE_INFINITY);
        }

        let protNumberAdded = false;
        switch (d.disp_prot) {
            case 'high':
                if (
                    settingsMap[AdvancedShowAndSortSettingsType.PROTEIN_HIGH]
                        .show
                ) {
                    vector.push(
                        settingsMap[
                            AdvancedShowAndSortSettingsType.PROTEIN_HIGH
                        ].sortBy
                    );
                    protNumberAdded = true;
                }
                break;
            case 'low':
                if (
                    settingsMap[AdvancedShowAndSortSettingsType.PROTEIN_LOW]
                        .show
                ) {
                    vector.push(
                        settingsMap[AdvancedShowAndSortSettingsType.PROTEIN_LOW]
                            .sortBy
                    );
                    protNumberAdded = true;
                }
                break;
        }
        if (!protNumberAdded) {
            vector.push(Number.POSITIVE_INFINITY);
        }

        return _.sortBy(vector);
    }

    function mandatory(d: GeneticTrackDatum): number[] {
        return mandatoryHelper(d);
    }
    function preferred(d: GeneticTrackDatum): (number | string)[] {
        // First, test if not sequenced
        // Last, use sample/patient id
        return [+!!d.na]
            .concat(mandatoryHelper(d))
            .concat([d.sample ? d.sample : d.patient!] as any);
    }
    return {
        preferred,
        mandatory,
        isVector: true,
    };
}

function makeNumericalComparator(value_key: string) {
    return function(d1: any, d2: any) {
        if (d1.na && d2.na) {
            return 0;
        } else if (d1.na && !d2.na) {
            return 2;
        } else if (!d1.na && d2.na) {
            return -2;
        } else {
            return d1[value_key] < d2[value_key]
                ? -1
                : d1[value_key] === d2[value_key]
                ? 0
                : 1;
        }
    };
}
export function stringClinicalComparator(d1: any, d2: any) {
    if (d1.na && d2.na) {
        return 0;
    } else if (d1.na && !d2.na) {
        return 2;
    } else if (!d1.na && d2.na) {
        return -2;
    } else {
        return naturalSort(d1.attr_val, d2.attr_val);
    }
}
function makeCountsMapClinicalComparator(categories: string[]) {
    return function(d1: any, d2: any) {
        if (d1.na && d2.na) {
            return 0;
        } else if (d1.na && !d2.na) {
            return 2;
        } else if (!d1.na && d2.na) {
            return -2;
        } else {
            var d1_total = 0;
            var d2_total = 0;
            for (var i = 0; i < categories.length; i++) {
                d1_total += d1.attr_val[categories[i]] || 0;
                d2_total += d2.attr_val[categories[i]] || 0;
            }
            if (d1_total === 0 && d2_total === 0) {
                return 0;
            } else if (d1_total === 0) {
                return 1;
            } else if (d2_total === 0) {
                return -1;
            } else {
                var d1_max_category = 0;
                var d2_max_category = 0;
                for (var i = 0; i < categories.length; i++) {
                    if (
                        d1.attr_val[categories[i]] >
                        d1.attr_val[categories[d1_max_category]]
                    ) {
                        d1_max_category = i;
                    }
                    if (
                        d2.attr_val[categories[i]] >
                        d2.attr_val[categories[d2_max_category]]
                    ) {
                        d2_max_category = i;
                    }
                }
                if (d1_max_category < d2_max_category) {
                    return -1;
                } else if (d1_max_category > d2_max_category) {
                    return 1;
                } else {
                    var cmp_category = categories[d1_max_category];
                    var d1_prop = d1.attr_val[cmp_category] / d1_total;
                    var d2_prop = d2.attr_val[cmp_category] / d2_total;
                    return sign(d1_prop - d2_prop);
                }
            }
        }
    };
}

export function alphabeticalDefault(comparator: (d1: any, d2: any) => number) {
    return function(d1: any, d2: any) {
        const cmp = comparator(d1, d2);
        if (cmp === 0) {
            if (d1.sample) {
                return naturalSort(d1.sample, d2.sample);
            } else {
                return naturalSort(d1.patient, d2.patient);
            }
        } else {
            return cmp;
        }
    };
}

export function getClinicalTrackSortComparator(track: ClinicalTrackSpec) {
    let comparator;
    switch (track.datatype) {
        case 'number':
            comparator = makeNumericalComparator('attr_val');
            break;
        case 'counts':
            comparator = makeCountsMapClinicalComparator(
                track.countsCategoryLabels
            );
            break;
        case 'string':
        default:
            comparator = stringClinicalComparator;
            break;
    }
    return {
        preferred: alphabeticalDefault(comparator),
        mandatory: comparator,
    };
}

export const heatmapTrackSortComparator = (() => {
    const comparator = makeNumericalComparator('profile_data');
    return {
        preferred: alphabeticalDefault(comparator),
        mandatory: comparator,
    };
})();
