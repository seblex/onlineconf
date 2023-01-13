import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

import * as API from '../api';
import { smartCompare } from './common';
import WhoAmIContext from './WhoAmIContext';

import HelpIcon from '@material-ui/icons/Help';
import EditIcon from '@material-ui/icons/Edit';

const styles = (theme: Theme) => createStyles({
	root: {
		overflow: 'auto',
	},
	alert: {
		color: theme.palette.error.dark,
	},
	head: {
		height: 40,
	},
	row: {
		height: 32,
	},
	delete: {
		padding: 2,
	},
});


interface PluginsProps {
	onError: (error: unknown) => void;
}


interface PluginsState {
	plugins: API.Plugin[];
}


class Plugins extends React.Component<PluginsProps & WithStyles<typeof styles> & WithTranslation> {
	static contextType = WhoAmIContext;

	state: PluginsState = {
		plugins: [],
	};

	componentDidMount() {
		this.load();
	}

	private async load() {
		try {
			const plugins = await API.getPlugins();
			this.state.plugins = plugins;
		} catch (error) {
			this.props.onError(error);
		}
	}

	render() {
		const { classes, t } = this.props;
		const { plugins } = this.state;

		return (
			<div className={classes.root}>
				<Table size="small">
					<TableHead>
						<TableRow className={classes.head}>
							<TableCell>{t('plugin.name')}</TableCell>
							<TableCell>{t('plugin.version')}</TableCell>
							<TableCell>{t('plugin.edit')}</TableCell>
							<TableCell>{t('plugin.about')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{plugins.map(plugin => {
							return (
								<TableRow key={plugin.name} className={classes.row}>
									<TableCell>{plugin.name}</TableCell>
									<TableCell>1.0.0</TableCell>
									<TableCell padding="none">
										<IconButton ><EditIcon/></IconButton>
									</TableCell>
									<TableCell padding="none">
										<IconButton ><HelpIcon/></IconButton>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		);
	}

}

export default withTranslation()(withStyles(styles)(Plugins));
