# Access Eash Part Individually:

```javascript
import {IAM} from 'relative/path/to/lambdatt-ui-iam'

// Endpoints:
IAM.ENDPOINTS
// Services:
IAM.SERVICES
// Components:
IAM.COMPONENTS
// Pages:
IAM.PAGES
```

# Auto-Wire:

To auto-wire the IAM module, add the following to your `/src/boot/iam-boot.js`:

```javascript
import {IAM} from 'relative/path/to/lambdatt-ui-iam'

export default boot(({ app }) => {
    IAM.autoWire(app);
})
```