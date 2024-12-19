import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { createSignal, useContext } from 'solid-js';
import PasswordChangeEditor from './PasswordChangeEditor';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { QueryContext } from '@glowman554/base-components/src/query/QueryController';
import UserOnly from '../UserOnly';
import Loading from '@glowman554/base-components/src/loading/Loading';

function Wrapped() {
    const query = useContext(QueryContext);
    const [changePasswordVisible, setChangePasswordVisible] = createSignal(false);

    return (
        <>
            <button class="button" onClick={() => setChangePasswordVisible(true)}>
                Change password
            </button>

            <Overlay visible={changePasswordVisible()}>
                <PasswordChangeEditor
                    submit={(oldPassword, newPassword, loading) =>
                        withQuery(
                            () => actions.authentication.changePassword.orThrow({ oldPassword, newPassword }),
                            loading,
                            false,
                            () => {
                                query.refetch('internal-status');
                            }
                        )
                    }
                />
            </Overlay>
        </>
    );
}

export default function () {
    return (
        <Loading initial={false}>
            <UserOnly>
                <Wrapped />
            </UserOnly>
        </Loading>
    );
}
