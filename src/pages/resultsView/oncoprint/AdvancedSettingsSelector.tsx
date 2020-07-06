import * as React from 'react';
import { observer } from 'mobx-react';
import { ResultsViewPageStore } from 'pages/resultsView/ResultsViewPageStore';
import {
    AdvancedShowAndSortSettings,
    AdvancedShowAndSortSettingsType,
} from 'shared/components/oncoprint/SortUtils';
import { Modal } from 'react-bootstrap';
import SimpleTable from 'shared/components/simpleTable/SimpleTable';
import _ from 'lodash';
import { computed, observable } from 'mobx';
import autobind from 'autobind-decorator';

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
        ).map(entry => {
            return (
                <tr>
                    <td>{entry[0]}</td>
                    <td>
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
                    <td>{entry[1].sortBy}</td>
                </tr>
            );
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
                    <SimpleTable headers={headers} rows={this.rows} />
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
