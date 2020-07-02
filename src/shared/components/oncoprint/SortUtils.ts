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
    [type in AdvancedShowAndSortSettingsType]: {
        show: boolean;
        sortBy: number;
    };
};

export const DefaultAdvancedShowAndSortSettings: AdvancedShowAndSortSettings = {
    [AdvancedShowAndSortSettingsType.FUSION]: {
        show: true,
        sortBy: 1,
    },
    [AdvancedShowAndSortSettingsType.AMP]: {
        show: true,
        sortBy: 2.1,
    },
    [AdvancedShowAndSortSettingsType.DEL]: {
        show: true,
        sortBy: 2.2,
    },
    [AdvancedShowAndSortSettingsType.GAIN]: {
        show: true,
        sortBy: 2.3,
    },
    [AdvancedShowAndSortSettingsType.HETLOSS]: {
        show: true,
        sortBy: 2.4,
    },
    [AdvancedShowAndSortSettingsType.DRIVER_MUTATION]: {
        show: true,
        sortBy: 3.0,
    },
    [AdvancedShowAndSortSettingsType.MUTATED]: {
        show: true,
        sortBy: 3.1,
    },
    [AdvancedShowAndSortSettingsType.TRUNCATING]: {
        show: true,
        sortBy: 3.1,
    },
    [AdvancedShowAndSortSettingsType.INFRAME]: {
        show: true,
        sortBy: 3.2,
    },
    [AdvancedShowAndSortSettingsType.PROMOTER]: {
        show: true,
        sortBy: 3.3,
    },
    [AdvancedShowAndSortSettingsType.MISSENSE]: {
        show: true,
        sortBy: 3.4,
    },
    [AdvancedShowAndSortSettingsType.OTHER_MUTATION]: {
        show: true,
        sortBy: 3.5,
    },
    [AdvancedShowAndSortSettingsType.GERMLINE]: {
        show: true,
        sortBy: 4,
    },
    [AdvancedShowAndSortSettingsType.MRNA_HIGH]: {
        show: true,
        sortBy: 5.1,
    },
    [AdvancedShowAndSortSettingsType.MRNA_LOW]: {
        show: true,
        sortBy: 5.2,
    },
    [AdvancedShowAndSortSettingsType.PROTEIN_HIGH]: {
        show: true,
        sortBy: 6.1,
    },
    [AdvancedShowAndSortSettingsType.PROTEIN_LOW]: {
        show: true,
        sortBy: 6.2,
    },
};

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

export function getGeneticTrackSortComparator(
    sortByMutationType?: boolean,
    sortByDrivers?: boolean
): {
    preferred: TrackSortVector<GeneticTrackDatum>;
    mandatory: TrackSortVector<GeneticTrackDatum>;
    isVector: true;
} {
    const settings = DefaultAdvancedShowAndSortSettings;
    function mandatoryHelper(d: GeneticTrackDatum): number[] {
        // TODO: respect show and sortBy settings

        const vector = [];

        // Create vector out of corresponding sort numbers,
        //  then return that vector sorted in ascending order.

        // Fusion
        if (
            d.disp_fusion &&
            settings[AdvancedShowAndSortSettingsType.FUSION].show
        ) {
            vector.push(
                settings[AdvancedShowAndSortSettingsType.FUSION].sortBy
            );
        } else {
            vector.push(Number.POSITIVE_INFINITY);
        }

        // CNA
        let cnaNumberAdded = false;
        switch (d.disp_cna) {
            case 'amp':
                if (settings[AdvancedShowAndSortSettingsType.AMP].show) {
                    vector.push(
                        settings[AdvancedShowAndSortSettingsType.AMP].sortBy
                    );
                    cnaNumberAdded = true;
                }
                break;
            case 'homdel':
                if (settings[AdvancedShowAndSortSettingsType.DEL].show) {
                    vector.push(
                        settings[AdvancedShowAndSortSettingsType.DEL].sortBy
                    );
                    cnaNumberAdded = true;
                }
                break;
            case 'gain':
                if (settings[AdvancedShowAndSortSettingsType.GAIN].show) {
                    vector.push(
                        settings[AdvancedShowAndSortSettingsType.GAIN].sortBy
                    );
                    cnaNumberAdded = true;
                }
                break;
            case 'hetloss':
                if (settings[AdvancedShowAndSortSettingsType.HETLOSS].show) {
                    vector.push(
                        settings[AdvancedShowAndSortSettingsType.HETLOSS].sortBy
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
            settings[AdvancedShowAndSortSettingsType.DRIVER_MUTATION].show
        ) {
            // Driver mutations
            switch (d.disp_mut) {
                case 'inframe_rec':
                case 'missense_rec':
                case "promoter_rec'":
                case 'trunc_rec':
                case 'other_rec':
                    vector.push(
                        settings[
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
                        settings[AdvancedShowAndSortSettingsType.INFRAME].show
                    ) {
                        vector.push(
                            settings[AdvancedShowAndSortSettingsType.INFRAME]
                                .sortBy
                        );
                        numberAdded = true;
                    }
                    break;
                case 'missense_rec':
                case 'missense':
                    if (
                        settings[AdvancedShowAndSortSettingsType.MISSENSE].show
                    ) {
                        vector.push(
                            settings[AdvancedShowAndSortSettingsType.MISSENSE]
                                .sortBy
                        );
                        numberAdded = true;
                    }
                    break;
                case 'promoter_rec':
                case 'promoter':
                    if (
                        settings[AdvancedShowAndSortSettingsType.PROMOTER].show
                    ) {
                        vector.push(
                            settings[AdvancedShowAndSortSettingsType.PROMOTER]
                                .sortBy
                        );
                        numberAdded = true;
                    }
                    break;
                case 'trunc_rec':
                case 'trunc':
                    if (
                        settings[AdvancedShowAndSortSettingsType.TRUNCATING]
                            .show
                    ) {
                        vector.push(
                            settings[AdvancedShowAndSortSettingsType.TRUNCATING]
                                .sortBy
                        );
                        numberAdded = true;
                    }
                    break;
                case 'other_rec':
                case 'other':
                    if (
                        settings[AdvancedShowAndSortSettingsType.OTHER_MUTATION]
                            .show
                    ) {
                        vector.push(
                            settings[
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
                settings[AdvancedShowAndSortSettingsType.MUTATED].show
            ) {
                vector.push(
                    settings[AdvancedShowAndSortSettingsType.MUTATED].sortBy
                );
            } else {
                vector.push(Number.POSITIVE_INFINITY);
            }
        }

        // Germline status
        if (
            d.disp_germ &&
            settings[AdvancedShowAndSortSettingsType.GERMLINE].show
        ) {
            vector.push(
                settings[AdvancedShowAndSortSettingsType.GERMLINE].sortBy
            );
        } else {
            vector.push(Number.POSITIVE_INFINITY);
        }

        // Mrna expression
        let mrnaNumberAdded = false;
        switch (d.disp_mrna) {
            case 'high':
                if (settings[AdvancedShowAndSortSettingsType.MRNA_HIGH].show) {
                    vector.push(
                        settings[AdvancedShowAndSortSettingsType.MRNA_HIGH]
                            .sortBy
                    );
                    mrnaNumberAdded = true;
                }
                break;
            case 'low':
                if (settings[AdvancedShowAndSortSettingsType.MRNA_LOW].show) {
                    vector.push(
                        settings[AdvancedShowAndSortSettingsType.MRNA_LOW]
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
                    settings[AdvancedShowAndSortSettingsType.PROTEIN_HIGH].show
                ) {
                    vector.push(
                        settings[AdvancedShowAndSortSettingsType.PROTEIN_HIGH]
                            .sortBy
                    );
                    protNumberAdded = true;
                }
                break;
            case 'low':
                if (
                    settings[AdvancedShowAndSortSettingsType.PROTEIN_LOW].show
                ) {
                    vector.push(
                        settings[AdvancedShowAndSortSettingsType.PROTEIN_LOW]
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
