import Loading from '@glowman554/base-components/src/loading/Loading';
import Query from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { For } from 'solid-js';
import AdministratorOnly from '../AdministratorOnly';
import ProjectNewButton from './ProjectNewButton';
import { ProjectEditorButtons } from './ProjectEditor';
import UserOnly from '../UserOnly';

function Wrapped() {
    return (
        <>
            <ProjectNewButton />
            <Query f={() => actions.projects.loadAll.orThrow()}>
                {(projects) => (
                    <For each={projects}>
                        {(project) => (
                            <div class="section-small">
                                <a href={`/projects/${project.id}`}>{project.name}</a>
                                <div>
                                    <ProjectEditorButtons project={project} />
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
            <UserOnly>
                <Wrapped />
            </UserOnly>
        </Loading>
    );
}
