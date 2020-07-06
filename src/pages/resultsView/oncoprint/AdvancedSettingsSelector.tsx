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
import { computed } from 'mobx';

export interface IAdvancedOncoprintSettingsProps {
    settings: AdvancedShowAndSortSettings;
    show: boolean;
    onHide: () => void;
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
    @computed get rows() {
        return _.sortBy(
            _.entries(this.props.settings),
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
                                this.props.settings[
                                    entry[0] as AdvancedShowAndSortSettingsType
                                ].show = !this.props.settings[
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

    public render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Advanced Show and Sort Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SimpleTable headers={headers} rows={this.rows} />
                </Modal.Body>
            </Modal>
        );
    }
}
