import { Exclude, Expose } from 'class-transformer';

// @Exclude() at the class level means: "by default, hide every field in this class."
// This is the strict mode for serialization — nothing gets out unless explicitly allowed.
@Exclude()
export class CustomerSummaryDto {
  // @Expose() marks this field as safe to include in the serialized response.
  // Only fields decorated with @Expose() survive when excludeExtraneousValues: true is set.
  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;
}
