import * as React from 'react';
import { observer } from 'mobx-react';
import {
    AdvancedShowAndSortSettings,
    getAdvancedSettingsWithSortBy,
} from 'shared/components/oncoprint/SortUtils';
import { Modal } from 'react-bootstrap';
import _ from 'lodash';
import { action, computed, observable, toJS } from 'mobx';
import autobind from 'autobind-decorator';
import SimpleDraggableTable, {
    DragHandle,
    SortableTr,
} from 'shared/components/simpleDraggableTable/SimpleDraggableTable';
import { stringListToIndexSet } from 'cbioportal-frontend-commons';
import LabeledCheckbox from 'shared/components/labeledCheckbox/LabeledCheckbox';

export interface IAdvancedOncoprintSettingsProps {
    settings: AdvancedShowAndSortSettings;
    show: boolean;
    onHide: () => void;
    updateSettings: (settings: AdvancedShowAndSortSettings) => void;
}

const headers = [
    <td>Alteration Type</td>,
    <td>Show?</td>,
    <td>Sort?</td>,
    <td>Sort priority</td>,
];

function findPreviousNonNullSortBy<T extends { sortBy: number | null }>(
    settings: T[],
    startIndex: number
) {
    for (let i = startIndex - 1; i >= 0; i--) {
        if (settings[i].sortBy !== null) {
            return settings[i];
        }
    }
    return null;
}

@observer
export default class AdvancedSettingsSelector extends React.Component<
    IAdvancedOncoprintSettingsProps,
    {}
> {
    @observable.deep workingSettings: AdvancedShowAndSortSettings;

    @computed get workingSettingsWithSortBy() {
        if (this.workingSettings) {
            return getAdvancedSettingsWithSortBy(this.workingSettings);
        } else {
            return [];
        }
    }

    @computed get rows() {
        if (!this.workingSettings) {
            return [];
        }

        return this.workingSettings.map((setting, index) => {
            const prevNonNull = findPreviousNonNullSortBy(
                this.workingSettingsWithSortBy,
                index
            );
            return {
                uid: setting.type,
                tr: (
                    <SortableTr index={index}>
                        <td style={{ width: 200 }}>{setting.type}</td>
                        <td style={{ width: 100 }}>
                            <input
                                type="checkbox"
                                checked={setting.show}
                                onClick={() => {
                                    setting.show = !setting.show;
                                }}
                            />
                        </td>
                        <td style={{ width: 100 }}>
                            <input
                                type="checkbox"
                                checked={!setting.disableSort}
                                onClick={() => {
                                    setting.disableSort = !setting.disableSort;
                                }}
                            />
                        </td>
                        <td style={{ width: 350 }}>
                            <DragHandle />
                            {setting.disableSort
                                ? '-'
                                : this.workingSettingsWithSortBy[index].sortBy}
                            {prevNonNull !== null && !setting.disableSort && (
                                <LabeledCheckbox
                                    checked={setting.sameSortPriorityAsPrevious}
                                    onChange={() => {
                                        setting.sameSortPriorityAsPrevious = !setting.sameSortPriorityAsPrevious;
                                    }}
                                    labelProps={{
                                        style: {
                                            display: 'inline-flex',
                                            marginLeft: 10,
                                            alignItems: 'center',
                                        },
                                    }}
                                >
                                    Same priority as {prevNonNull.type}
                                </LabeledCheckbox>
                            )}
                        </td>
                    </SortableTr>
                ),
            };
        });
    }

    @autobind
    private saveAndApply() {
        this.props.updateSettings(toJS(this.workingSettings));
    }

    @autobind
    private onShow() {
        this.workingSettings = toJS(this.props.settings);
    }

    @autobind
    @action
    private onSort(uids: string[]) {
        const indexes = stringListToIndexSet(uids);
        this.workingSettings = _.sortBy(
            this.workingSettings,
            s => indexes[s.type]
        );
    }

    public render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                onShow={this.onShow}
                dialogClassName={'advancedSettingsSelector'}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Advanced Oncoprint Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SimpleDraggableTable
                        headers={headers}
                        rows={this.rows}
                        onSort={this.onSort}
                        useDragHandle={true}
                    />
                </Modal.Body>
                <button
                    className={'btn btn-primary btn-md'}
                    onClick={this.saveAndApply}
                    style={{ width: '100%', padding: 20 }}
                >
                    Save and Apply
                </button>
            </Modal>
        );
    }
}
