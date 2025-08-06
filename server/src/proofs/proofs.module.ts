import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Proof } from "./entities/proof.entity";
import { ProofsService } from "./proofs.service";

@Module({
  imports: [TypeOrmModule.forFeature([Proof])],
  providers: [ProofsService],
  exports: [ProofsService],
})
export class ProofsModule {}
