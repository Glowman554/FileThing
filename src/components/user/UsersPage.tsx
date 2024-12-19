import Loading from '@glowman554/base-components/src/loading/Loading';
import Query from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { For } from 'solid-js';
import { UserEditorButtons } from './UserEditor';
import UserNewButton from './UserNewButton';
import AdministratorOnly from '../AdministratorOnly';

function Wrapped() {
    return (
        <>
            <UserNewButton />
            <Query f={() => actions.users.loadAll.orThrow()}>
                {(users) => (
                    <For each={users}>
                        {(user) => (
                            <div class="section-small">
                                {user.username}
                                <div class="flex flex-row">
                                    <UserEditorButtons user={user} />
                                </div>
                            </div>
                        )}
                    </For>
                )}
            </Query>
        </>
    );
}

export default function () {
    return (
        <Loading initial={false}>
            <AdministratorOnly>
                <Wrapped />
            </AdministratorOnly>
        </Loading>
    );
}
