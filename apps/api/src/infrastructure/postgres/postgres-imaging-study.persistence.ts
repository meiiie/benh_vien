import type pg from "pg";
import type { ImagingStudy } from "@benh-vien-so/domain";
import { imagingStudyToUpsertValues } from "./postgres-imaging-study.mapper.js";
import { upsertImagingStudySql } from "./postgres-imaging-study.sql.js";

export async function upsertImagingStudy(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  imagingStudy: ImagingStudy
): Promise<void> {
  await queryable.query(
    upsertImagingStudySql,
    imagingStudyToUpsertValues(imagingStudy)
  );
}
