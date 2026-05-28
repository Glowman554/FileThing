import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import UserOnly from '../UserOnly';
import { actions } from 'astro:actions';
import { useContext } from 'solid-js';
import { withQuery } from '@glowman554/base-components/src/query/Query';

function Wrapped() {
    const loading = useContext(LoadingContext);

    return (
        <button
            class="button"
            onClick={() =>
                withQuery(
                    () => actions.projects.vacuum.orThrow(),
                    loading,
                    true,
                    () => {}
                )
            }
        >
            Vacuum
        </button>
    );
}

export default function () {
    return <Wrapped />;
}
