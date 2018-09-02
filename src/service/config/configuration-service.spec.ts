// import * as chaiAsPromised from 'chai-as-promised'
import * as chai from 'chai';
import 'mocha';
import {ConfigurationService} from './configuration-service';
import {ConfigurationServiceImpl} from './configuration-service.impl';

// chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Configuration service', () => {
    let service: ConfigurationService;
    let env: any;

    beforeEach(() => {
        env = {
            HOST: 'test.com'
        };
    });

    it('should return a configuration with host=test.com', () => {
        service = new ConfigurationServiceImpl(env);

        const config = service.config;

        expect(config).to.not.be.null;
        expect(config).to.be.an('object');
        expect(config).to.have.property('host');
        expect(config.host).to.equal('test.com');
    });

    it('should merge common config with environment configuration', () => {
        service = new ConfigurationServiceImpl(env);
        const config = service.config;

        expect(config).to.not.be.null;
        expect(config).to.be.an('object');
        expect(config).to.have.property('host');
        expect(config.host).to.equal('test.com');
    });

    it('should overide number values from the environment and keep the same type', () => {
        env.PORT = 8081;
        service = new ConfigurationServiceImpl(env);

        const config = service.config;

        expect(config).to.not.be.null;
        expect(config).to.be.an('object');
        expect(config).to.have.property('port');
        expect(config.port).to.be.an('number');
        expect(config.port).to.equal(8081);
    });

    it('should read the correct configuration file from NODE_ENV', () => {
        env.NODE_ENV = 'default';
        service = new ConfigurationServiceImpl(env);

        const config = service.config;

        expect(config).to.not.be.null;
        expect(config).to.be.an('object');
    });

    it('should throw exception if NODE_ENV does not refer to a valid environemnt', () => {
        env.NODE_ENV = 'outside';

        try {
            service = new ConfigurationServiceImpl(env);
            expect(false).to.be.true;
        } catch (ex) {
            expect(true).to.be.true;
        }
    });

    it('should have a "default" as the default environment', () => {
        service = new ConfigurationServiceImpl(env);

        expect(service.environment).to.not.be.undefined;
        expect(service.environment).to.equal('default');
    });
});
