import * as React from 'react';
import { observer } from 'mobx-react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
} from 'react-sortable-hoc';
import { HTMLProps } from 'react';
import autobind from 'autobind-decorator';
import './styles.scss';
import { Portal } from 'react-portal';
import { computed, observable, reaction } from 'mobx';

export const DragHandle = SortableHandle(() => (
    <i style={{ cursor: 'pointer', margin: 5 }} className="fa fa-bars" />
));
export const SortableTr = SortableElement(
    (props: HTMLProps<HTMLTableRowElement>) => {
        return <tr {...props} />;
    }
);
const SortableTable = SortableContainer(
    (props: HTMLProps<HTMLTableElement>) => {
        return <table {...props} />;
    }
);

export interface ISimpleDraggableTableProps {
    headers: JSX.Element[];

    // the td's have to have fixed width or else dragging won't look good
    rows: { uid: string; tr: JSX.Element }[];

    onSort: (uids: string[]) => void;
    useDragHandle?: boolean;
}

@observer
export default class SimpleDraggableTable extends React.Component<
    ISimpleDraggableTableProps,
    {}
> {
    private draggingContainer: any;

    @autobind
    private onSortEnd(params: { oldIndex: number; newIndex: number }) {
        const uidOrder = this.props.rows.map(r => r.uid);
        const poppedUid = uidOrder.splice(params.oldIndex, 1)[0];
        uidOrder.splice(params.newIndex, 0, poppedUid);
        this.props.onSort(uidOrder);
    }

    public render() {
        const { headers, rows } = this.props;

        return (
            <>
                <SortableTable
                    className="simple-draggable-table table table-striped table-border-top"
                    onSortEnd={this.onSortEnd}
                    helperContainer={
                        () =>
                            this
                                .draggingContainer /* has to be a function or else it may not update with the ref */
                    }
                    lockAxis={'y'}
                    lockToContainerEdges={true}
                    useDragHandle={this.props.useDragHandle}
                    useWindowAsScrollContainer={true}
                    helperClass="dragging"
                >
                    <thead>
                        <tr>{headers}</tr>
                    </thead>
                    <tbody>{rows.map(r => r.tr)}</tbody>
                </SortableTable>
                <Portal isOpened={true} node={document.body}>
                    {/*
                        This is an annoying, but totally necessary hack to make dragging work.
                        react-sortable-hoc renders the dragged row with position:fixed. If we let
                        it render straight to the document.body (default) then the tr doesn't
                        render properly (outside a <table> element). If we render it to the
                        same tbody it came from, then the positioning breaks. Thus, we have
                        to render it to a dummy table thats positioned at 0,0.
                    */}
                    <table className="simple-draggable-table table table-striped table-border-top">
                        <tbody
                            ref={x => {
                                this.draggingContainer = x;
                            }}
                        ></tbody>
                    </table>
                </Portal>
            </>
        );
    }
}
