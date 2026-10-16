<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep this project as a TanStack Start catalogue design prototype; commerce interactions use in-memory React state so no real checkout or account operation is implied.
- Define aeinstal presentation tokens and reusable layout styles in src/styles.css; UI actions use the shared Button component.
- Store the homepage catalogue and category definitions in a browser-safe module, independently of route rendering, for reusable search and quick-order interactions.
- Category pages live at /categorie/$slug; browser-safe category catalogue helpers own filtering, demo technical attributes, and page-size options so route rendering does not define business rules.
