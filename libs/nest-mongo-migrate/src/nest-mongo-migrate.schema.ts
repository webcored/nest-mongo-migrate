import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { MigrationAction } from './nest-mongo-migrate.interface.dto';

@Schema({ timestamps: true })
class Migration {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, enum: MigrationAction })
  status: string;
}

type MigrationDocument = Migration & Document;
type MigrationModel = Model<MigrationDocument>;

const MigrationSchema = SchemaFactory.createForClass(Migration);

export { Migration, MigrationModel, MigrationDocument, MigrationSchema };
