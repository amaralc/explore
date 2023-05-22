import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PeerEntity } from '@peerlab/researchers/peers/core/domains/peers/entities/peer/entity';
import { Document } from 'mongoose';

@Schema({ collection: 'peers' })
export class MongoosePeer extends Document implements PeerEntity {
  @Prop({ type: String })
  override id!: string;

  @Prop({ type: String })
  name!: string;

  @Prop({ type: String })
  username!: string;

  @Prop({ type: Array<string> })
  subjects!: string[];
}

export const MongoosePeerSchema = SchemaFactory.createForClass(MongoosePeer);
