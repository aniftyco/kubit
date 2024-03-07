import Scheduler from '@ioc:Kubit/Scheduler';

/*
|--------------------------------------------------------------------------
| Scheduled tasks
|--------------------------------------------------------------------------
|
| Scheduled tasks allow you to run recurrent tasks in the background of your
| application. Here you can define all your scheduled tasks.
|
| You can define a scheduled task using the `.call` method on the Scheduler object
| as shown in the following example
|
| ```
| 	Scheduler.call(() => {
|			console.log('I am a scheduled task')
| 	}).everyMinute()
| ```
|
| The example above will print the message `I am a scheduled task` every minute.
|
| You can also schedule console commands using the `.command` method on the Scheduler
| object as shown in the following example
|
| ```
| 	Scheduler.command('greet').everyMinute()
| ```
|
| The example above will run the `greet` command every minute.
|
| Happy scheduling!
*/
