import { EntityRepository, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@EntityRepository(TaskEntity)
export class TaskRepository extends Repository<TaskEntity> {

  async createTask(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    const { title, description } = createTaskDto;
    const task = new TaskEntity();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    await task.save();

    return task;
  }

  async getTaskById(id: number): Promise<TaskEntity> {
    const found = await this.findOne(id);
    if (!found)
      throw new NotFoundException('Task with id not found');
    return found;
  }

  async getTasks(filterDto: GetTasksFilterDto): Promise<TaskEntity[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task_entity');

    if (status) {
      query.andWhere('task_entity.status = :status', { status });
    }

    if (search) {
      query.andWhere('(task_entity.title LIKE :search OR task_entity.description LIKE :search)', { search: `%${search}%` });
    }

    const task = await query.getMany();

    return task;
  }

}
