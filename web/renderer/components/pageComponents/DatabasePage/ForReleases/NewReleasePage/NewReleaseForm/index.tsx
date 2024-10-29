import BranchAndCommitSelector from "@components/FormSelectForRefs/BranchAndCommitSelector";
import HeaderUserCheckbox from "@components/HeaderUserCheckbox";
import {
  Button,
  ButtonsWithError,
  FormInput,
  Loader,
  Textarea,
} from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import { releases } from "@lib/urls";
import { useRouter } from "next/router";
import { SyntheticEvent } from "react";
import css from "./index.module.css";
import useCreateTag from "./useCreateTag";

type Props = {
  params: OptionalRefParams;
};

export default function NewTagForm(props: Props): JSX.Element {
  const router = useRouter();

  const createTagRes = useCreateTag(props.params);

  const goToReleases = () => {
    const { href, as } = releases(props.params);
    router.push(href, as).catch(console.error);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const data = await createTagRes.createTag();
    if (!data) return;

    goToReleases();
  };

  return (
    <div>
      <form data-cy="new-tag-form" onSubmit={onSubmit}>
        <div className={css.container}>
          <BranchAndCommitSelector
            {...props}
            selectedValue={createTagRes.formData.fromRefName}
            onChangeValue={s => createTagRes.setFormData({ fromRefName: s })}
          />
          <FormInput
            value={createTagRes.formData.tagName}
            onChangeString={s => createTagRes.setFormData({ tagName: s })}
            label="Tag name"
            placeholder="i.e. v1"
            className={css.input}
            data-cy="new-tag-name-input"
          />
          <Textarea
            rows={4}
            value={createTagRes.formData.message}
            placeholder="Describe this release"
            label="Description"
            onChangeString={s => createTagRes.setFormData({ message: s })}
            className={css.textarea}
            data-cy="new-tag-description-textarea"
          />
          <HeaderUserCheckbox
            shouldAddAuthor={createTagRes.formData.addTagAuthor}
            setShouldAddAuthor={s =>
              createTagRes.setFormData({ addTagAuthor: s })
            }
            userHeaders={createTagRes.userHeaders}
            kind="tag"
          />
          <ButtonsWithError
            data-cy="new-tag-button-group"
            onCancel={goToReleases}
            error={createTagRes.creationErr}
          >
            <Button
              type="submit"
              disabled={!createTagRes.canCreateTag}
              data-cy="new-tag-button"
            >
              Create release
            </Button>
          </ButtonsWithError>
        </div>
        <Loader loaded={!createTagRes.loading} />
      </form>
    </div>
  );
}
