import * as React from 'react';
import { observer } from 'mobx-react';
import {
    AdvancedShowAndSortSettings,
    AdvancedShowAndSortSettingsType,
} from 'shared/components/oncoprint/SortUtils';
import { Modal } from 'react-bootstrap';
import SimpleTable from 'shared/components/simpleTable/SimpleTable';
import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import SimpleDraggableTable, {
    DragHandle,
    SortableTr,
} from 'shared/components/simpleDraggableTable/SimpleDraggableTable';

export interface IAdvancedOncoprintSettingsProps {
    settings: Readonly<AdvancedShowAndSortSettings>;
    show: boolean;
    onHide: () => void;
    updateSettings: (settings: AdvancedShowAndSortSettings) => void;
}

const headers = [
    <td>Alteration Type</td>,
    <td>Show in Oncoprint?</td>,
    <td>Sort priority</td>,
];

@observer
export default class AdvancedSettingsSelector extends React.Component<
    IAdvancedOncoprintSettingsProps,
    {}
> {
    @observable workingSettings: AdvancedShowAndSortSettings;

    @computed get rows() {
        if (!this.workingSettings) {
            return [];
        }

        return _.sortBy(
            _.entries(this.workingSettings),
            entry => entry[1].sortBy
        ).map((entry, index) => {
            return {
                uid: entry[0],
                tr: (
                    <SortableTr index={index}>
                        <td style={{ width: 200 }}>{entry[0]}</td>
                        <td style={{ width: 200 }}>
                            <input
                                type="checkbox"
                                checked={entry[1].show}
                                onClick={() => {
                                    this.workingSettings[
                                        entry[0] as AdvancedShowAndSortSettingsType
                                    ].show = !this.workingSettings[
                                        entry[0] as AdvancedShowAndSortSettingsType
                                    ].show;
                                }}
                            />
                        </td>
                        <td style={{ width: 200 }}>
                            <DragHandle />
                            {entry[1].sortBy}
                        </td>
                    </SortableTr>
                ),
            };
        });
    }

    @autobind
    private saveAndApply() {
        this.props.updateSettings(this.workingSettings);
    }

    @autobind
    private onShow() {
        this.workingSettings = this.props.settings;
    }

    @autobind
    @action
    private onSort(uids: string[]) {
        uids.forEach((uid, index) => {
            this.workingSettings[
                uid as AdvancedShowAndSortSettingsType
            ].sortBy = index + 1; // 1-based indexes are more user-friendly
        });
    }

    public render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                onShow={this.onShow}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Advanced Show and Sort Settings</Modal.Title>
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
