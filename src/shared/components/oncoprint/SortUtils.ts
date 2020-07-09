import { TrackSortVector } from 'oncoprintjs';
import { ClinicalTrackSpec, GeneticTrackDatum } from './Oncoprint';
import naturalSort from 'javascript-natural-sort';
import _ from 'lodash';
import {
    AdvancedShowAndSortSettings,
    AdvancedShowAndSortSettingsType,
    DataValueToAdvancedSettingsType,
    DefaultAdvancedShowAndSortSettings,
    getAdvancedSettingsWithSortBy,
    getMutatedSortBy,
} from './AdvancedSettingsUtils';

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
    const settingsType = AdvancedShowAndSortSettingsType;

    function addNumberToSortVector(x: number | null, vector: number[]) {
        if (x === null) {
            vector.push(Number.POSITIVE_INFINITY);
        } else {
            vector.push(x);
        }
    }

    function mandatoryHelper(d: GeneticTrackDatum): number[] {
        const vector: number[] = [];

        // Create vector out of corresponding sort numbers,
        //  then return that vector sorted in ascending order.

        // Fusion
        if (d.disp_fusion && settingsMap[settingsType.FUSION].show) {
            addNumberToSortVector(
                settingsMap[settingsType.FUSION].sortBy,
                vector
            );
        } else {
            addNumberToSortVector(Number.POSITIVE_INFINITY, vector);
        }

        // CNA
        const setting =
            settingsMap[DataValueToAdvancedSettingsType[d.disp_cna!]];
        if (setting && setting.show) {
            addNumberToSortVector(setting.sortBy, vector);
        } else {
            addNumberToSortVector(Number.POSITIVE_INFINITY, vector);
        }

        if (sortByDrivers && settingsMap[settingsType.DRIVER_MUTATION].show) {
            // Driver mutations
            switch (d.disp_mut) {
                case 'inframe_rec':
                case 'missense_rec':
                case "promoter_rec'":
                case 'trunc_rec':
                case 'other_rec':
                    addNumberToSortVector(
                        settingsMap[settingsType.DRIVER_MUTATION].sortBy,
                        vector
                    );
                    break;
                default:
                    addNumberToSortVector(Number.POSITIVE_INFINITY, vector);
            }
        }

        if (sortByMutationType) {
            // Mutation type
            const setting =
                settingsMap[DataValueToAdvancedSettingsType[d.disp_mut!]];
            if (setting && setting.show) {
                addNumberToSortVector(setting.sortBy, vector);
            } else {
                addNumberToSortVector(Number.POSITIVE_INFINITY, vector);
            }
        } else {
            if (d.disp_mut) {
                addNumberToSortVector(getMutatedSortBy(settingsMap), vector);
            } else {
                addNumberToSortVector(Number.POSITIVE_INFINITY, vector);
            }
        }

        // Germline status
        if (d.disp_germ && settingsMap[settingsType.GERMLINE].show) {
            addNumberToSortVector(
                settingsMap[settingsType.GERMLINE].sortBy,
                vector
            );
        } else {
            addNumberToSortVector(Number.POSITIVE_INFINITY, vector);
        }

        // Mrna expression
        let mrnaNumberAdded = false;
        switch (d.disp_mrna) {
            case 'high':
                if (settingsMap[settingsType.MRNA_HIGH].show) {
                    addNumberToSortVector(
                        settingsMap[settingsType.MRNA_HIGH].sortBy,
                        vector
                    );
                    mrnaNumberAdded = true;
                }
                break;
            case 'low':
                if (settingsMap[settingsType.MRNA_LOW].show) {
                    addNumberToSortVector(
                        settingsMap[settingsType.MRNA_LOW].sortBy,
                        vector
                    );
                    mrnaNumberAdded = true;
                }
                break;
        }
        if (!mrnaNumberAdded) {
            addNumberToSortVector(Number.POSITIVE_INFINITY, vector);
        }

        let protNumberAdded = false;
        switch (d.disp_prot) {
            case 'high':
                if (settingsMap[settingsType.PROTEIN_HIGH].show) {
                    addNumberToSortVector(
                        settingsMap[settingsType.PROTEIN_HIGH].sortBy,
                        vector
                    );
                    protNumberAdded = true;
                }
                break;
            case 'low':
                if (settingsMap[settingsType.PROTEIN_LOW].show) {
                    addNumberToSortVector(
                        settingsMap[settingsType.PROTEIN_LOW].sortBy,
                        vector
                    );
                    protNumberAdded = true;
                }
                break;
        }
        if (!protNumberAdded) {
            addNumberToSortVector(Number.POSITIVE_INFINITY, vector);
        }

        return _.sortBy(
            vector.map(x => {
                if (x === null) {
                    return Number.POSITIVE_INFINITY;
                } else {
                    return x;
                }
            })
        );
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
