import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function ParametresPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configuration de l&apos;enseigne et du compte
        </p>
      </div>

      {/* Enseigne */}
      <Card>
        <CardHeader>
          <CardTitle>Enseigne</CardTitle>
          <CardDescription>Informations sur l&apos;enseigne</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l&apos;enseigne</Label>
            <Input id="name" defaultValue="FNAC" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <Input id="logo" type="file" accept="image/*" />
            <p className="text-sm text-muted-foreground">
              Format recommandé: PNG, 200x200px
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email de contact</Label>
            <Input id="email" type="email" defaultValue="contact@fnac.com" />
          </div>
          <Button>Enregistrer</Button>
        </CardContent>
      </Card>

      {/* Utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>Gestion des accès et rôles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="font-medium">Admin Swiim</div>
                <div className="text-sm text-muted-foreground">admin@swiim.com</div>
              </div>
              <Badge variant="default">Admin</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="font-medium">Manager FNAC</div>
                <div className="text-sm text-muted-foreground">manager@fnac.com</div>
              </div>
              <Badge variant="secondary">Manager</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Opérateur Store</div>
                <div className="text-sm text-muted-foreground">operateur@fnac.com</div>
              </div>
              <Badge variant="outline">Opérateur</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intégrations */}
      <Card>
        <CardHeader>
          <CardTitle>Intégrations</CardTitle>
          <CardDescription>Configuration des intégrations TPE et PSP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="font-medium mb-2">Terminaux de paiement (TPE)</div>
              <p className="text-sm text-muted-foreground">
                Les intégrations TPE sont gérées automatiquement via l&apos;API Swiim.
                Les terminaux sont configurés et suivis dans la section &quot;TPE &amp; Clés&quot;.
              </p>
            </div>
            <div className="border-t pt-4">
              <div className="font-medium mb-2">PSP (Processeurs de paiement)</div>
              <p className="text-sm text-muted-foreground">
                L&apos;intégration avec les processeurs de paiement (Stripe, Square, etc.)
                serait configurée dans cette section pour la production.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

