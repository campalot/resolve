import { builder } from './builder';

// 1. Initialize the root Query container once
builder.queryType({});

// 2. Import the separate domain files to execute their queryFields decorators
import './identity';
import './workspace';
import './interaction';
import "./activity";
import "./search";

// 3. Export the compiled, fully stitched schema object
export const schema = builder.toSchema();

const interactionsField = schema
  .getQueryType()!
  .getFields()
  .interactions;

