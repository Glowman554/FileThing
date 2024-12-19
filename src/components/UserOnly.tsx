import QueryController from '@glowman554/base-components/src/query/QueryController';
import Internal from './user/Internal';
import type { JSX } from 'solid-js';

export default function (props: { children?: JSX.Element }) {
    return (
        <QueryController>
            <Internal check={(u) => true}>{props.children}</Internal>
        </QueryController>
    );
}
