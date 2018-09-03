/* @flow */

// Core
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import updateNotifier from 'update-notifier';
import pkg from '../../package.json';

updateNotifier({ pkg }).notify();

// Utils
import { promisify } from 'util';
import { exec as rawExec } from 'child_process';

const exec = promisify(rawExec);

// Parts
import packageJson from './templates/_package.json';

export default class Ui extends Generator {
    constructor(args: Object, options: Object) {
        super(args, options);

        this.log(
            yosay(`Команда ${chalk.blueBright('Lectrum')} приветствует тебя!`),
        );
    }

    _writeDotfiles() {
        this.fs.copy(
            this.templatePath('gitignore'),
            this.destinationPath('.gitignore'),
        );
        this.fs.copy(
            this.templatePath('editorconfig'),
            this.destinationPath('.editorconfig'),
        );
        this.fs.copy(
            this.templatePath('eslintignore'),
            this.destinationPath('.eslintignore'),
        );
        this.fs.copy(
            this.templatePath('eslintrc.yaml'),
            this.destinationPath('.eslintrc.yaml'),
        );
        this.fs.copy(this.templatePath('czrc'), this.destinationPath('.czrc'));
        this.fs.copy(
            this.templatePath('stylelintrc'),
            this.destinationPath('.stylelintrc'),
        );
        this.fs.copy(
            this.templatePath('stylelintignore'),
            this.destinationPath('.stylelintignore'),
        );
        this.fs.copy(
            this.templatePath('browserslistrc'),
            this.destinationPath('.browserslistrc'),
        );
        this.fs.copy(
            this.templatePath('babelrc.js'),
            this.destinationPath('.babelrc.js'),
        );
    }

    _writeRegularFiles() {
        this.fs.copy(
            this.templatePath('_LICENSE'),
            this.destinationPath('LICENSE'),
        );
        this.fs.copy(
            this.templatePath('_README.md'),
            this.destinationPath('README.md'),
        );
        this.fs.copy(
            this.templatePath('_nodemon.json'),
            this.destinationPath('nodemon.json'),
        );
    }

    _writeDirectories() {
        this.fs.copy(
            this.templatePath('_webpack'),
            this.destinationPath('webpack'),
        );
        this.fs.copy(
            this.templatePath('_static'),
            this.destinationPath('static'),
        );
    }

    _writePackageJson() {
        const isPackageJsonExists = this.fs.exists('package.json');

        if (isPackageJsonExists) {
            const {
                name,
                version,
                author,
                private: isPrivate,
                dependencies,
            } = JSON.parse(this.fs.read('package.json'));

            this.fs.delete('package.json');

            this.fs.writeJSON('package.json', {
                name,
                version,
                author,
                private:         isPrivate,
                scripts:         packageJson.scripts,
                dependencies,
                devDependencies: packageJson.devDependencies,
            });
        } else {
            this.fs.writeJSON('package.json', {
                name:            'my-app',
                version:         '0.0.0',
                private:         false,
                scripts:         packageJson.scripts,
                devDependencies: packageJson.devDependencies,
            });
        }

        this.fs.copy(
            this.templatePath('_package-lock.json'),
            this.destinationPath('package-lock.json'),
        );
        this.fs.copy(
            this.templatePath('_yarn.lock'),
            this.destinationPath('yarn.lock'),
        );
    }

    writing() {
        this._writeDotfiles();
        this._writeRegularFiles();
        this._writeDirectories();
        this._writePackageJson();
    }

    async install() {
        const yarn = chalk.blue('yarn');
        const npm = chalk.red('npm');

        try {
            await exec('yarn');
            this.log(
                chalk.bgBlack(
                    `${chalk.greenBright('✓ ')} ${yarn} ${chalk.whiteBright(
                        'found.\nInstalling dependencies with',
                    )} ${yarn}.`,
                ),
            );
            this.yarnInstall();
        } catch (error) {
            this.log(
                chalk.bgBlack(
                    `${chalk.red('x ')}${yarn} ${chalk.whiteBright(
                        'not found.\nInstalling dependencies with',
                    )} ${npm}.`,
                ),
            );
            this.npmInstall();
            this.log(error.message);
        }
    }

    end() {
        this.config.save();
    }
}
