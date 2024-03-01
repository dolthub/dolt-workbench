import Button from "@components/Button";
import ButtonsWithError from "@components/ButtonsWithError";
import CustomFormSelect from "@components/CustomFormSelect";
import ErrorMsg from "@components/ErrorMsg";
import { FormInput, Loader, Textarea } from "@dolthub/react-components";
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
          <CustomFormSelect.ForBranchesAndCommits
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
          {/* <div>
            <Checkbox
              name="add-author"
              label="Use my name and email as tag author"
              checked={createTagRes.formData.addTagAuthor}
              onChange={e =>
                createTagRes.setFormData({ addTagAuthor: e.target.checked })
              }
              description="Recommended. If unchecked, Dolt System Account will be used as tag author."
              />
          </div> */}
          <ButtonsWithError
            data-cy="new-tag-button-group"
            onCancel={goToReleases}
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
        <ErrorMsg className={css.error} err={createTagRes.creationErr} />
      </form>
    </div>
  );
}
