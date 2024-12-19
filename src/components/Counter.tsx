import { createSignal, type JSX } from 'solid-js';
import Internal from './user/Internal';
import QueryController from '@glowman554/base-components/src/query/QueryController';

export default function Counter(props: { children?: JSX.Element }) {
    const [count, setCount] = createSignal(0);
    const add = () => setCount(count() + 1);
    const subtract = () => setCount(count() - 1);

    return (
        <QueryController>
            <Internal check={(u) => u.administrator} />
            <div class="section">
                <button class="button" onClick={subtract}>
                    -
                </button>
                <pre>{count()}</pre>
                <button class="button" onClick={add}>
                    +
                </button>
            </div>
            <div>{props.children}</div>
        </QueryController>
    );
}
